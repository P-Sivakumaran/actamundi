import { NextResponse } from 'next/server'
import { ethers } from 'ethers'

/** Verification is looked up live from Human Passport's API, never
 * self-asserted into the wallet's own signed profile — same reasoning as
 * the AI-likelihood check in suggest-category/route.ts: nothing in this
 * p2p app's publish path could bind a self-reported field to the truth,
 * so a `verified` field in models/P2PProfile.ts would just be a field any
 * wallet could lie in. This is public, address-keyed data instead — same
 * trust shape as resolving an ENS name. */

const PASSPORT_API_BASE = 'https://api.passport.xyz'

export async function GET(request: Request) {
  const apiKey = process.env.PASSPORT_API_KEY
  const scorerId = process.env.PASSPORT_SCORER_ID
  if (!apiKey || !scorerId) {
    return NextResponse.json({ configured: false }, { status: 503 })
  }

  const address = new URL(request.url).searchParams.get('address')
  if (!address || !ethers.isAddress(address)) {
    return NextResponse.json({ error: 'A valid wallet address is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${PASSPORT_API_BASE}/v2/stamps/${scorerId}/score/${address}`, {
      headers: { 'X-API-KEY': apiKey },
      // Scores don't change minute to minute, and this is fetched on every
      // profile view — cache to stay well under the 125 req/15min tier.
      next: { revalidate: 3600 },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Passport lookup failed' }, { status: 502 })
    }
    const data = await res.json()
    return NextResponse.json({
      configured: true,
      score: Number(data.score),
      passingScore: Boolean(data.passing_score),
      threshold: Number(data.threshold),
    })
  } catch {
    return NextResponse.json({ error: 'Passport lookup temporarily unavailable' }, { status: 502 })
  }
}
