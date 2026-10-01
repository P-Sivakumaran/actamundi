// PROTOTYPE DATA — not the real P2PArticle shape. Adds a `verification`
// field we don't have wired from TruthVerification.sol into the p2p layer
// yet; this prototype exists to decide whether/how that should surface,
// ahead of actually wiring it.

export type VerificationStatus = 'verified' | 'disputed' | 'unverified' | 'falsehood'

export interface MockArticle {
  cid: string
  title: string
  excerpt: string
  coverImageUrl: string
  category: string
  tags: string[]
  readingTime: number
  authorAddr: string
  authorName: string
  createdAt: string
  verification: {
    status: VerificationStatus
    verifierCount: number
  }
}

const authors = [
  { addr: '0x4a1b...9f3c', name: 'J. Okafor' },
  { addr: '0x7e2d...1a8b', name: 'M. Reyes' },
  { addr: '0x9c5f...4e2a', name: 'S. Lindqvist' },
  { addr: '0x2b8a...6d1f', name: 'R. Chaudhary' },
]

export const MOCK_ARTICLES: MockArticle[] = [
  {
    cid: 'bafy1demo001',
    title: 'City council quietly rezones waterfront for private development',
    excerpt: 'Leaked planning documents show a fast-tracked rezoning that bypassed the usual public comment period.',
    coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    category: 'Local',
    tags: ['housing', 'city-council'],
    readingTime: 6,
    authorAddr: authors[0].addr,
    authorName: authors[0].name,
    createdAt: '2026-09-29T14:00:00Z',
    verification: { status: 'verified', verifierCount: 14 },
  },
  {
    cid: 'bafy1demo002',
    title: 'Viral claim: new vaccine batch linked to adverse reactions',
    excerpt: 'A widely shared post claims a specific lot number is unsafe. Here is what the actual adverse-event data shows.',
    coverImageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80',
    category: 'Health',
    tags: ['health', 'fact-check'],
    readingTime: 4,
    authorAddr: authors[1].addr,
    authorName: authors[1].name,
    createdAt: '2026-09-30T09:15:00Z',
    verification: { status: 'falsehood', verifierCount: 22 },
  },
  {
    cid: 'bafy1demo003',
    title: 'Central bank signals rate cut as inflation cools',
    excerpt: 'Minutes from the latest meeting suggest policymakers are more confident inflation is under control.',
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
    category: 'Economy',
    tags: ['economy', 'policy'],
    readingTime: 5,
    authorAddr: authors[2].addr,
    authorName: authors[2].name,
    createdAt: '2026-09-30T11:30:00Z',
    verification: { status: 'verified', verifierCount: 9 },
  },
  {
    cid: 'bafy1demo004',
    title: 'Startup claims its new battery doubles EV range',
    excerpt: 'The company has not published independent test results, and two verifiers have flagged the claim as unsubstantiated.',
    coverImageUrl: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=800&q=80',
    category: 'Tech',
    tags: ['energy', 'startups'],
    readingTime: 3,
    authorAddr: authors[3].addr,
    authorName: authors[3].name,
    createdAt: '2026-09-30T16:45:00Z',
    verification: { status: 'disputed', verifierCount: 5 },
  },
  {
    cid: 'bafy1demo005',
    title: 'Local school district faces budget shortfall for third year running',
    excerpt: 'Administrators say rising costs and flat state funding are forcing cuts to after-school programs.',
    coverImageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80',
    category: 'Education',
    tags: ['education', 'budget'],
    readingTime: 7,
    authorAddr: authors[0].addr,
    authorName: authors[0].name,
    createdAt: '2026-09-28T08:00:00Z',
    verification: { status: 'unverified', verifierCount: 0 },
  },
  {
    cid: 'bafy1demo006',
    title: 'Independent audit confirms irregularities in municipal contract bidding',
    excerpt: 'A six-month investigation found three contracts awarded without the required competitive bidding process.',
    coverImageUrl: 'https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800&q=80',
    category: 'Local',
    tags: ['corruption', 'investigation'],
    readingTime: 9,
    authorAddr: authors[1].addr,
    authorName: authors[1].name,
    createdAt: '2026-09-27T13:20:00Z',
    verification: { status: 'verified', verifierCount: 31 },
  },
  {
    cid: 'bafy1demo007',
    title: 'Study linking screen time to attention issues retracted',
    excerpt: 'The journal cited methodological flaws after independent researchers could not reproduce the results.',
    coverImageUrl: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&q=80',
    category: 'Health',
    tags: ['research', 'retraction'],
    readingTime: 4,
    authorAddr: authors[2].addr,
    authorName: authors[2].name,
    createdAt: '2026-09-26T10:00:00Z',
    verification: { status: 'disputed', verifierCount: 11 },
  },
  {
    cid: 'bafy1demo008',
    title: 'New transit line opens three months ahead of schedule',
    excerpt: 'Officials credit a modular construction approach for the early completion and under-budget delivery.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
    category: 'Local',
    tags: ['transit', 'infrastructure'],
    readingTime: 3,
    authorAddr: authors[3].addr,
    authorName: authors[3].name,
    createdAt: '2026-09-25T17:00:00Z',
    verification: { status: 'verified', verifierCount: 7 },
  },
]
