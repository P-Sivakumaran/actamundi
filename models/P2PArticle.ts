/**
 * Content-addressed replacement for the Mongo-backed Article in Article.ts.
 * `cid` is the IPFS hash of the signed article body — this is what
 * TruthVerification.sol should reference instead of a Mongo `_id`,
 * since a CID is tamper-evident and the `_id` never was.
 */
export interface P2PArticle {
  cid: string
  /** cid of the previous version, undefined for the first version of a slug */
  prevCid?: string
  slug: string
  title: string
  content: string
  excerpt?: string
  /** IPFS cid of the cover image blob, replaces Cloudinary URL */
  coverImageCid?: string
  category?: string
  tags?: string[]
  status: 'draft' | 'published'
  /** wallet address that signed this version, reuses existing ethers/NextAuth wallet auth */
  authorAddr: string
  /** signature over JSON.stringify(P2PArticleInput) by authorAddr */
  signature: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  readingTime: number
  /** true once superseded by a tombstone version — the log is append-only, nothing is truly deleted */
  tombstone?: boolean
}

export type P2PArticleInput = Omit<
  P2PArticle,
  'cid' | 'signature' | 'authorAddr' | 'updatedAt'
>
