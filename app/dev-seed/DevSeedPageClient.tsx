'use client'

/**
 * DEV-ONLY test-data seeder — not linked from nav, ships ungated like
 * /error-test and /sentry-test. Publishes real p2p articles (and moderation
 * actions) into THIS BROWSER'S local IndexedDB blockstore using throwaway
 * local signers — never touches a real wallet extension or any real funds.
 * The private keys below are Hardhat's well-known default test accounts
 * (public, zero-value, the standard "this is fake" signal) — never use them
 * for anything real.
 *
 * publishArticle()/getP2PNode() are browser-only (IndexedDB blockstore), so
 * this has to run as a page, not a script — see lib/p2p/node.ts.
 */
import { useState } from 'react'
import { ethers } from 'ethers'
import slugify from 'slugify'
import { Button } from '@/components/ui/button'
import { publishArticle } from '@/lib/p2p/articles'
import type { P2PArticleInput } from '@/models/P2PArticle'

const TEST_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', // author A
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690', // author B
  '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a', // board (moderator)
]

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(40) +
  '\n\n## A heading\n\n' +
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. '.repeat(40)

function article(overrides: Partial<P2PArticleInput> & { title: string }): P2PArticleInput {
  const now = new Date().toISOString()
  return {
    slug: slugify(overrides.title, { lower: true, strict: true }),
    content: LOREM,
    excerpt: 'A short lorem-ipsum excerpt for edge-case testing.',
    category: 'Ideas',
    status: 'published',
    createdAt: now,
    publishedAt: now,
    readingTime: 5,
    ...overrides,
  }
}

const ARTICLES: P2PArticleInput[] = [
  article({ title: 'Baseline article with a cover image', coverImageCid: undefined, category: 'Politics' }),
  article({ title: 'No cover image at all — tests the fallback gradient', coverImageCid: undefined }),
  article({
    title: 'Broken cover image CID — tests the gateway 404 path',
    coverImageCid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
  }),
  article({ title: '', excerpt: '', readingTime: 0 }), // empty title/excerpt edge case
  article({
    title:
      'An absurdly long headline that should wrap, clamp, or otherwise behave itself across every card and detail-page layout no matter how many words get crammed into it',
  }),
  article({
    title: 'Sanitization check: <script>alert(1)</script> & <img src=x onerror=alert(2)>',
    content: `<script>alert('xss')</script><img src=x onerror="alert('xss')"><p>${LOREM}</p>`,
  }),
  article({ title: 'Draft, never published', status: 'draft', publishedAt: undefined }),
  article({ title: 'Culture piece with no category', category: undefined }),
  article({ title: 'Tiny one-liner', content: 'Short.', readingTime: 1 }),
];

type LogFn = (line: string) => void

async function seedArticles(log: LogFn) {
  const authorA = new ethers.Wallet(TEST_KEYS[0])
  const authorB = new ethers.Wallet(TEST_KEYS[1])
  log(`Author A: ${authorA.address}`)
  log(`Author B: ${authorB.address}`)

  const published: { slug: string; cid: string; authorAddr: string }[] = []

  for (let i = 0; i < ARTICLES.length; i++) {
    const input = ARTICLES[i]
    const signer = i % 2 === 0 ? authorA : authorB
    try {
      const result = await publishArticle(input, signer)
      published.push({ slug: result.slug, cid: result.cid, authorAddr: result.authorAddr })
      log(`✓ ${input.title || '(empty title)'} -> ${result.cid}`)
    } catch (err) {
      log(`✗ ${input.title || '(empty title)'} -> ${err instanceof Error ? err.message : err}`)
    }
  }

  // Version chain: republish the baseline article under the same slug/author
  // with prevCid set, so the detail page's version-history section has
  // something to show.
  const baseline = published.find((p) => p.slug === ARTICLES[0].slug)
  if (baseline) {
    const v2 = await publishArticle(
      { ...ARTICLES[0], title: 'Baseline article with a cover image (edited)', prevCid: baseline.cid },
      authorA
    )
    log(`✓ version chain: ${v2.cid} -> prevCid ${baseline.cid}`)
  }

  // Tombstone: "delete" the tiny one-liner by publishing a tombstoned
  // version to the same slug, same shape hooks/use-p2p-articles.ts's
  // deleteArticle() uses.
  const tiny = published.find((p) => p.slug === ARTICLES.at(-1)!.slug)
  if (tiny) {
    await publishArticle(
      {
        slug: tiny.slug,
        title: ARTICLES.at(-1)!.title,
        content: '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        readingTime: 0,
        tombstone: true,
        prevCid: tiny.cid,
      },
      authorA
    )
    log(`✓ tombstoned: ${tiny.slug}`)
  }

  return published
}

async function seedModeration(published: { slug: string; cid: string }[], log: LogFn) {
  // Dynamically imported, not top-level: lib/p2p/moderation.ts's import graph
  // can't survive Next's build-time static-prerender pass (see lib/p2p/node.ts's
  // own comment on the same class of problem) — only ever load it in-browser.
  const { openModerationDB, createModerationClient, getModerationPolicy } = await import(
    '@/lib/p2p/moderation'
  )
  const board = new ethers.Wallet(TEST_KEYS[2])
  log(`Board wallet: ${board.address}`)

  let policy
  try {
    policy = getModerationPolicy()
  } catch {
    log(
      `⚠ Skipped moderation actions — set NEXT_PUBLIC_MODERATION_BOARD_ADDRS=["${board.address}"] in .env.local and restart dev, then re-seed.`
    )
    return
  }
  if (!policy.boardAddrs.includes(board.address.toLowerCase())) {
    log(
      `⚠ Skipped moderation actions — ${board.address} isn't in NEXT_PUBLIC_MODERATION_BOARD_ADDRS. Add it and restart dev, then re-seed.`
    )
    return
  }

  const client = createModerationClient(policy, openModerationDB)
  const actions: Array<['endorse' | 'flag' | 'delist', number, string?]> = [
    ['endorse', 0, 'Checked against primary sources.'],
    ['flag', 1, 'Needs a correction on the second paragraph.'],
    ['delist', 2, 'Broken cover image, pulled pending a fix.'],
  ]
  for (const [action, idx, reason] of actions) {
    const target = published[idx]
    if (!target) continue
    await client.publishModerationAction({ cid: target.cid, action, reason }, board)
    log(`✓ ${action} -> ${target.cid}`)
  }
}

async function seedProfiles(log: LogFn) {
  // Dynamically imported — same browser-only constraint as moderation.ts.
  const { publishProfile } = await import('@/lib/p2p/profile')
  const authorA = new ethers.Wallet(TEST_KEYS[0])
  const authorB = new ethers.Wallet(TEST_KEYS[1])

  await publishProfile(
    { displayName: 'Author A', bio: 'Writes about politics and ideas. Seeded test profile.' },
    authorA
  )
  log(`✓ profile -> ${authorA.address}`)

  await publishProfile({ displayName: 'Author B', bio: 'Culture desk. Seeded test profile.' }, authorB)
  log(`✓ profile -> ${authorB.address}`)
}

async function seedFollows(log: LogFn) {
  const { publishFollowAction } = await import('@/lib/p2p/follow')
  const authorA = new ethers.Wallet(TEST_KEYS[0])
  const authorB = new ethers.Wallet(TEST_KEYS[1])
  const board = new ethers.Wallet(TEST_KEYS[2])

  await publishFollowAction({ followedAddr: authorA.address, action: 'follow' }, authorB)
  log(`✓ ${authorB.address} follows ${authorA.address}`)
  await publishFollowAction({ followedAddr: authorA.address, action: 'follow' }, board)
  log(`✓ ${board.address} follows ${authorA.address}`)
}

async function seedComments(published: { slug: string; cid: string }[], log: LogFn) {
  const { publishComment } = await import('@/lib/p2p/comments')
  const authorA = new ethers.Wallet(TEST_KEYS[0])
  const authorB = new ethers.Wallet(TEST_KEYS[1])
  const target = published[0]
  if (!target) {
    log('⚠ Skipped comments — no published article to attach them to.')
    return
  }

  const top = await publishComment({ cid: target.cid, body: 'Great piece — thanks for writing this up.' }, authorB)
  log(`✓ comment -> ${target.cid}`)
  await publishComment({ cid: target.cid, parentId: top.id, body: 'Agreed, especially the second section.' }, authorA)
  log(`✓ reply -> ${top.id}`)
}

export default function DevSeedPageClient() {
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  async function run() {
    setRunning(true)
    setLog([])
    const append = (line: string) => setLog((prev) => [...prev, line])
    try {
      const published = await seedArticles(append)
      await seedModeration(published, append)
      await seedProfiles(append)
      await seedFollows(append)
      await seedComments(published, append)
      append('Done.')
    } catch (err) {
      append(`Fatal: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
        Dev-only. Publishes fake lorem-ipsum articles into this browser&apos;s local p2p
        store using well-known throwaway test keys — never a real wallet, never real funds.
      </div>
      <Button onClick={run} disabled={running}>
        {running ? 'Seeding…' : 'Seed test articles'}
      </Button>
      <pre className="mt-6 whitespace-pre-wrap rounded-md bg-muted/30 p-4 text-xs">
        {log.join('\n')}
      </pre>
    </div>
  )
}
