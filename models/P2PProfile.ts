/**
 * `authorAddr` (not `walletAddr`) deliberately matches P2PArticle's field
 * name — AuthorAccessController and signing.ts's verifyArticleSignatureFor
 * strip/compare a hardcoded `authorAddr` key, so reusing that exact name is
 * what makes reusing those functions unchanged actually work.
 */
export interface P2PProfile {
  authorAddr: string
  displayName?: string
  bio?: string
  /** IPFS cid of the avatar blob, published the same way as article cover images */
  avatarCid?: string
  signature: string
  updatedAt: string
}

export type P2PProfileInput = Omit<P2PProfile, 'authorAddr' | 'signature' | 'updatedAt'>
