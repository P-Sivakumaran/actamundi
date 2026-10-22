import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { ethers } from 'ethers'
import { TypeSafeClient, choice, score } from '@typesafe-ai/sdk'
import { authOptions } from '@/lib/auth'

const AI_CHECK_DOMAIN = 'actamundi.ai-check.v1'
const MAX_CHALLENGE_AGE_MS = 5 * 60 * 1000

/** Board members authenticate purely by wallet signature everywhere else in
 * this app (moderation actions have no NextAuth involvement at all) — this
 * is the one alternate path on an otherwise session-gated route, for board
 * members who may not have (or want) the single shared NextAuth admin login.
 * Reads NEXT_PUBLIC_MODERATION_BOARD_ADDRS directly rather than importing
 * from lib/p2p/moderation.ts — that module's own comments warn it can pull
 * the OrbitDB/IndexedDB chain into Next's build-time static analysis, the
 * exact crash class this app has already hit more than once. Not worth the
 * risk to save a few lines. */
function configuredBoardAddrs(): string[] {
  try {
    const raw = process.env.NEXT_PUBLIC_MODERATION_BOARD_ADDRS
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((a): a is string => typeof a === 'string').map((a) => a.toLowerCase())
  } catch {
    return []
  }
}

function verifyBoardAuth(boardAuth: unknown): boolean {
  if (!boardAuth || typeof boardAuth !== 'object') return false
  const { address, signature, timestamp, targetCid } = boardAuth as Record<string, unknown>
  if (
    typeof address !== 'string' || typeof signature !== 'string' ||
    typeof timestamp !== 'string' || typeof targetCid !== 'string'
  ) return false

  const age = Date.now() - Date.parse(timestamp)
  if (!Number.isFinite(age) || age < 0 || age > MAX_CHALLENGE_AGE_MS) return false

  if (!configuredBoardAddrs().includes(address.toLowerCase())) return false

  try {
    const recovered = ethers.verifyMessage(`${AI_CHECK_DOMAIN}:${targetCid}:${timestamp}`, signature)
    return recovered.toLowerCase() === address.toLowerCase()
  } catch {
    return false
  }
}

/** Ordered low-to-high rubric, not a hard classifier — no detector is
 * reliable enough to gate publishing on (even the best run 10-30% false
 * positive/negative, and are beaten by light paraphrasing). This is an
 * authoring aid shown to the person writing the draft, not persisted to the
 * article and not a moderation signal: nothing in this p2p app's publish
 * path could bind the result to what actually gets signed and published,
 * so treating it as trustworthy input to moderation would be dishonest. */
const AI_LIKELIHOOD_CRITERIA = [
  'Highly distinctive human voice — idiosyncratic phrasing, personal anecdotes, or specific unverifiable detail.',
  'Likely human-written — natural rhythm and specificity, reads cleanly.',
  'Ambiguous — no strong signal either way; could be human-written or lightly AI-assisted.',
  'Likely AI-generated — generic phrasing, hedge-heavy, formulaic structure typical of LLM output.',
  'Strongly AI-generated — repetitive transitions, generic listy claims, near-templated structure with little specific detail.',
] as const

/** The only categories the site actually navigates by (see app/layout.tsx's
 * header nav) — suggesting outside this set would point at a page that
 * doesn't exist. "Other" covers content that doesn't fit; the author can
 * still type anything else by hand regardless of what's suggested here. */
const CATEGORIES = {
  Politics: 'Government, elections, policy, international relations.',
  Culture: 'Arts, entertainment, society, lifestyle.',
  Ideas: 'Opinion, analysis, essays, commentary.',
  Other: "Doesn't clearly fit Politics, Culture, or Ideas.",
} as const

export async function POST(request: Request) {
  const { title, excerpt, content, boardAuth } = await request.json()

  // Advisory-only and server-side-keyed — gated so an unauthenticated
  // caller can't spend the configured TypeSafe budget for free. Two valid
  // credentials: the author's own NextAuth admin session (the original
  // "Suggest" button), or a board member's wallet signature (the
  // moderation panel's "Check AI-likelihood" button) — see verifyBoardAuth.
  const session = await getServerSession(authOptions)
  if (!session && !verifyBoardAuth(boardAuth)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key = process.env.TYPESAFE_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'Category suggestion is not configured' }, { status: 503 })
  }

  if (typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'A title is required' }, { status: 400 })
  }

  try {
    const client = new TypeSafeClient()
    const response = await client.systemOne({
      state: {
        title: title.slice(0, 300),
        excerpt: typeof excerpt === 'string' ? excerpt.slice(0, 500) : '',
        // A few paragraphs is plenty of signal for a category call and
        // keeps the request well inside the per-question context limit.
        content: typeof content === 'string' ? content.slice(0, 4000) : '',
      },
      questions: {
        category: choice('Which category best fits this article?', CATEGORIES),
        // Independent judgment over the same state, asked in parallel —
        // one round trip, not a second request.
        aiLikelihood: score(
          'How much does this text read like AI-generated writing, versus a distinctive human voice?',
          AI_LIKELIHOOD_CRITERIA
        ),
      },
    })
    return NextResponse.json({
      category: response.answers.category.choice,
      confidence: response.answers.category.confidence,
      aiLikelihood: {
        score: response.answers.aiLikelihood.score,
        confidence: response.answers.aiLikelihood.confidence,
        legend: response.answers.aiLikelihood.legend,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Category suggestion is temporarily unavailable' }, { status: 502 })
  }
}
