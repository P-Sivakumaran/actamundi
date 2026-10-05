import { ArticleFeedCard } from '@/components/ArticleFeedCard'
import type { P2PArticle } from '@/models/P2PArticle'
import type { ModerationAction } from '@/lib/p2p/moderation'

const AUTHOR = '0x71F29e4f8a2b6c9d1e3f5a7b8c9d0e1f2a3b4c5d'
const BOARD = '0x4B921a8b9c3f4e5d6a7b8c9d0e1f2a3b4c5d6e7f'

const baseArticle: P2PArticle = {
  cid: 'bafyrezoning',
  slug: 'waterfront-rezoning',
  status: 'published',
  title: 'The quiet infrastructure powering a new era of public reporting',
  excerpt: 'Across cities, small newsrooms are building resilient networks that keep local stories visible, verifiable, and alive.',
  content: '<p>placeholder</p>',
  category: 'World',
  authorAddr: AUTHOR,
  signature: 'demo',
  createdAt: '2026-10-03T14:00:00Z',
  updatedAt: '2026-10-03T14:00:00Z',
  publishedAt: '2026-10-03T14:00:00Z',
  readingTime: 6,
}

function frame(children: React.ReactNode) {
  return <div style={{ width: 340, height: 520, borderRadius: 16, overflow: 'hidden' }}>{children}</div>
}

export function Endorsed() {
  const moderation: ModerationAction = {
    cid: baseArticle.cid, action: 'endorse', boardAddr: BOARD, signature: 'demo',
    reason: 'Documents independently confirmed', timestamp: '2026-10-03T15:00:00Z',
  }
  return frame(<ArticleFeedCard article={baseArticle} coverImageUrl={undefined} moderation={moderation} linkToArticle={false} />)
}

export function Flagged() {
  const article: P2PArticle = {
    ...baseArticle,
    cid: 'bafyvaccine',
    title: 'Viral claim: new vaccine batch linked to adverse reactions',
    excerpt: 'A widely shared post claims a specific lot number is unsafe. Here is what the actual adverse-event data shows.',
    category: 'Health',
    readingTime: 4,
  }
  const moderation: ModerationAction = {
    cid: article.cid, action: 'flag', boardAddr: BOARD, signature: 'demo',
    reason: 'Awaiting lab confirmation', timestamp: '2026-10-03T10:00:00Z',
  }
  return frame(<ArticleFeedCard article={article} coverImageUrl={undefined} moderation={moderation} linkToArticle={false} />)
}

export function Unreviewed() {
  const article: P2PArticle = {
    ...baseArticle,
    cid: 'bafyratecut',
    title: 'Central bank signals rate cut as inflation cools',
    excerpt: 'Minutes from the latest meeting suggest policymakers are more confident inflation is under control.',
    category: 'Economy',
    readingTime: 5,
  }
  return frame(<ArticleFeedCard article={article} coverImageUrl={undefined} moderation={undefined} linkToArticle={false} />)
}

export function NoExcerptNoCategory() {
  const article: P2PArticle = {
    ...baseArticle,
    cid: 'bafyminimal',
    title: 'A public record should belong to the public',
    excerpt: undefined,
    category: undefined,
    readingTime: 0,
  }
  return frame(<ArticleFeedCard article={article} coverImageUrl={undefined} moderation={undefined} linkToArticle={false} />)
}
