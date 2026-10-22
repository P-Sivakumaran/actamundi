export interface Comment {
  /** client-minted UUID, stable across a comment's edit/tombstone history */
  id: string
  /** cid of the article this comment belongs to */
  cid: string
  /** id of the comment this is a reply to, undefined for a top-level comment */
  parentId?: string
  /** wallet address that signed this entry */
  authorAddr: string
  body: string
  /** signature over the canonical signed body by authorAddr */
  signature: string
  timestamp: string
  /** true for a delete: a later, same-id entry that supersedes the original.
   * Only honored if its authorAddr matches the original comment's author —
   * see lib/p2p/comments.ts's reduceComments(). */
  tombstone?: boolean
}

export type CommentInput = Pick<Comment, 'cid' | 'parentId' | 'body'>
