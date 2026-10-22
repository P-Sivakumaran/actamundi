/**
 * Comments, one OrbitDB "events" store per article — NOT a single global
 * log like follow.ts. Every open store replicates its entire history to
 * every peer that opens it (confirmed against @orbitdb/core's own
 * documents.js/events.js: neither store type supports an indexed/filtered
 * read). A global comments log would mean reading one article's thread
 * replicates every comment ever posted on every article by anyone, forever
 * — comments are the highest-volume, highest-cardinality write path in the
 * app, unlike moderation's small-board-bounded log. Keying the store by the
 * article's own content-address bounds replication cost to "comments on
 * articles you've actually opened," the same cost shape already accepted
 * for the articles themselves. See lib/p2p/SOCIAL.md.
 */
import { ethers } from 'ethers'
import { SelfSignedAccessController } from './access-controller'
import { signableBody } from './signing'
import type { Comment, CommentInput } from '@/models/P2PComment'

export type { Comment, CommentInput } from '@/models/P2PComment'

const COMMENTS_DOMAIN = 'actamundi.comments.v1'
const MAX_COMMENT_BODY_LENGTH = 5000

interface Signer {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

export interface CommentStore {
  add(value: Comment): Promise<string>
  all(): Promise<Array<{ value: unknown }>>
  events: {
    on(event: 'update', callback: () => void): void
    off(event: 'update', callback: () => void): void
  }
}

export function commentSignableBody(c: Omit<Comment, 'signature'>): string {
  const { id, cid, parentId, authorAddr, body, timestamp, tombstone } = c
  return signableBody({
    domain: COMMENTS_DOMAIN, id, cid, authorAddr, body, timestamp,
    ...(parentId === undefined ? {} : { parentId }),
    ...(tombstone === undefined ? {} : { tombstone }),
  })
}

/** Schema + self-signature check, scoped to one article — a store opened
 * for articleCid X must never accept an entry claiming a different cid,
 * even if otherwise validly signed (that'd let a forged entry ride in under
 * the wrong article's identity). Reused as the access controller's `verify`
 * predicate and again at read time, same double-check discipline as
 * verifyModerationAction. */
export function verifyComment(value: unknown, articleCid: string): value is Comment {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const doc = value as Record<string, unknown>
    const keys = ['id', 'cid', 'parentId', 'authorAddr', 'body', 'signature', 'timestamp', 'tombstone']
    if (Object.keys(doc).some((key) => !keys.includes(key))) return false
    if (typeof doc.id !== 'string' || !doc.id) return false
    if (doc.cid !== articleCid) return false
    if ('parentId' in doc && typeof doc.parentId !== 'string') return false
    if (typeof doc.authorAddr !== 'string' || !ethers.isAddress(doc.authorAddr)) return false
    if (typeof doc.body !== 'string' || doc.body.length > MAX_COMMENT_BODY_LENGTH) return false
    if ('tombstone' in doc && typeof doc.tombstone !== 'boolean') return false
    if (!doc.tombstone && !doc.body.trim()) return false
    if (typeof doc.signature !== 'string') return false
    if (typeof doc.timestamp !== 'string' || new Date(doc.timestamp).toISOString() !== doc.timestamp) return false
    const recovered = ethers.verifyMessage(commentSignableBody(doc as unknown as Comment), doc.signature)
    return recovered.toLowerCase() === doc.authorAddr.toLowerCase()
  } catch {
    return false
  }
}

/** Latest-per-id wins, same reduction shape as activeModerationByCid/
 * activeFollowEdges — but with one extra rule neither of those needs: a
 * later entry for an existing id (i.e. a tombstone) only supersedes the
 * original if it's signed by the SAME authorAddr as the original. The
 * access controller alone can't enforce this — canAppend only sees one
 * entry at a time and can't know who authored some other entry sharing its
 * id, so a wallet could validly self-sign a tombstone claiming an id it
 * never authored. This reduction is what actually blocks that forgery. */
export function reduceComments(values: unknown[], articleCid: string): Comment[] {
  const byId = new Map<string, Comment[]>()
  for (const value of values) {
    if (!verifyComment(value, articleCid)) continue
    const list = byId.get(value.id) ?? []
    list.push(value)
    byId.set(value.id, list)
  }

  const result: Comment[] = []
  for (const entries of Array.from(byId.values())) {
    entries.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    const original = entries[0]
    const fromOriginalAuthor = entries.filter(
      (e) => e.authorAddr.toLowerCase() === original.authorAddr.toLowerCase()
    )
    const latest = fromOriginalAuthor[fromOriginalAuthor.length - 1]
    if (!latest.tombstone) result.push(latest)
  }
  return result.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
}

const openingByArticle = new Map<string, Promise<CommentStore>>()

export function openCommentsDB(articleCid: string): Promise<CommentStore> {
  let opening = openingByArticle.get(articleCid)
  if (!opening) {
    opening = (async () => {
      // Dynamically imported, not top-level — see follow.ts's identical
      // comment; the p2p stack must never load at module-eval time.
      const [{ getOrbitDB }, { useAccessController }] = await Promise.all([
        import('./orbitdb'), import('@orbitdb/core'),
      ])
      useAccessController(SelfSignedAccessController as any)
      const orbit = await getOrbitDB()
      return orbit.open(`${COMMENTS_DOMAIN}.${articleCid}`, {
        type: 'events',
        AccessController: SelfSignedAccessController({
          domain: COMMENTS_DOMAIN,
          scope: articleCid,
          verify: (doc) => verifyComment(doc, articleCid),
        }),
      }) as Promise<CommentStore>
    })().catch((error) => { openingByArticle.delete(articleCid); throw error })
    openingByArticle.set(articleCid, opening)
  }
  return opening
}

export async function publishComment(input: CommentInput, signer: Signer): Promise<Comment> {
  const authorAddr = (await signer.getAddress()).toLowerCase()
  const id = crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const body = {
    id, cid: input.cid, authorAddr, body: input.body, timestamp,
    ...(input.parentId === undefined ? {} : { parentId: input.parentId }),
  }
  const signature = await signer.signMessage(commentSignableBody(body))
  const comment: Comment = { ...body, signature }
  if (!verifyComment(comment, input.cid)) throw new Error('Invalid comment or signature')
  await (await openCommentsDB(input.cid)).add(comment)
  return comment
}

export async function deleteComment(id: string, articleCid: string, signer: Signer): Promise<void> {
  const authorAddr = (await signer.getAddress()).toLowerCase()
  const timestamp = new Date().toISOString()
  const body = { id, cid: articleCid, authorAddr, body: '', timestamp, tombstone: true }
  const signature = await signer.signMessage(commentSignableBody(body))
  const tombstone: Comment = { ...body, signature }
  if (!verifyComment(tombstone, articleCid)) throw new Error('Invalid comment tombstone or signature')
  await (await openCommentsDB(articleCid)).add(tombstone)
}

export async function fetchComments(articleCid: string): Promise<Comment[]> {
  const entries = await (await openCommentsDB(articleCid)).all()
  return reduceComments(entries.map((entry) => entry.value), articleCid)
}

/** Same serialized-refresh shape as subscribeToModeration/subscribeToFollowGraph. */
export async function subscribeToComments(
  articleCid: string,
  onChange: (comments: Comment[]) => void,
  onError: (error: unknown) => void
): Promise<() => void> {
  const db = await openCommentsDB(articleCid)
  let stopped = false
  let pending = Promise.resolve()
  const refresh = () => {
    pending = pending.then(async () => {
      if (stopped) return
      const entries = await db.all()
      const comments = reduceComments(entries.map((entry) => entry.value), articleCid)
      if (!stopped) onChange(comments)
    }).catch((error) => { if (!stopped) onError(error) })
  }
  db.events.on('update', refresh)
  refresh()
  return () => { stopped = true; db.events.off('update', refresh) }
}
