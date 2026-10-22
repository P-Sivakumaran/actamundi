import { ethers } from 'ethers'
import { CID } from 'multiformats/cid'
import { canonicalStringify, signableBody } from './signing'

export interface BoardPolicy {
  boardAddrs: string[]
  threshold: number
}

export interface ModerationAction {
  cid: string
  action: 'endorse' | 'flag' | 'delist'
  boardAddr: string
  signature: string
  reason?: string
  timestamp: string
}

export type ModerationInput = Pick<ModerationAction, 'cid' | 'action' | 'reason'>
export const MODERATION_DOMAIN = 'actamundi.moderation.v1'

const COMMENT_TARGET_PREFIX = 'comment:'

/** A moderation action's `cid` field normally holds a real article CID.
 * Comments don't have one (they're identified by a client-minted UUID, see
 * models/P2PComment.ts) — rather than restructuring ModerationAction into a
 * tagged union (which would cascade through every `moderationStatus.get(cid)`
 * call site treating `cid` as an opaque string key), comments are targeted
 * by this composite string instead. Every existing reader keeps working
 * unchanged; only verifyModerationAction's validation needs to recognize
 * the second shape. */
export function commentModerationTarget(articleCid: string, commentId: string): string {
  return `${COMMENT_TARGET_PREFIX}${articleCid}:${commentId}`
}

export function parseCommentModerationTarget(cid: string): { articleCid: string; commentId: string } | null {
  if (!cid.startsWith(COMMENT_TARGET_PREFIX)) return null
  const rest = cid.slice(COMMENT_TARGET_PREFIX.length)
  const sep = rest.indexOf(':')
  if (sep < 0) return null
  const articleCid = rest.slice(0, sep)
  const commentId = rest.slice(sep + 1)
  if (!articleCid || !commentId) return null
  return { articleCid, commentId }
}

export function normalizeBoardPolicy(policy: BoardPolicy): BoardPolicy {
  if (policy.threshold !== 1) throw new Error('Only threshold=1 is supported')
  if (!Array.isArray(policy.boardAddrs) || policy.boardAddrs.length === 0) {
    throw new Error('A non-empty moderation board is required')
  }
  const boardAddrs = policy.boardAddrs.map((address) => {
    if (!ethers.isAddress(address) || address.toLowerCase() === ethers.ZeroAddress) {
      throw new Error('Invalid moderation board address')
    }
    return address.toLowerCase()
  })
  return { boardAddrs: Array.from(new Set(boardAddrs)).sort(), threshold: 1 }
}

// The CID is the article being moderated, so unlike article envelopes it MUST
// remain signed. Bind signatures to the protocol and fixed board policy too.
export function moderationSignableBody(
  action: Omit<ModerationAction, 'signature'>,
  policy: BoardPolicy
): string {
  const { cid, boardAddr, timestamp, reason } = action
  return signableBody({
    domain: MODERATION_DOMAIN,
    policy: normalizeBoardPolicy(policy),
    cid, action: action.action, boardAddr, timestamp,
    ...(reason === undefined ? {} : { reason }),
  })
}

export function verifyModerationAction(value: unknown, policy: BoardPolicy): value is ModerationAction {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const doc = value as Record<string, unknown>
    const keys = ['cid', 'action', 'boardAddr', 'signature', 'reason', 'timestamp']
    if (Object.keys(doc).some((key) => !keys.includes(key))) return false
    if (typeof doc.cid !== 'string') return false
    const isRealCid = (() => {
      try { return CID.parse(doc.cid as string).toString() === doc.cid } catch { return false }
    })()
    if (!isRealCid && !parseCommentModerationTarget(doc.cid)) return false
    if (!['endorse', 'flag', 'delist'].includes(doc.action as string)) return false
    if (typeof doc.boardAddr !== 'string' || typeof doc.signature !== 'string') return false
    if (typeof doc.timestamp !== 'string' || new Date(doc.timestamp).toISOString() !== doc.timestamp) return false
    if ('reason' in doc && typeof doc.reason !== 'string') return false
    const board = normalizeBoardPolicy(policy)
    if (!board.boardAddrs.includes(doc.boardAddr.toLowerCase())) return false
    const recovered = ethers.verifyMessage(
      moderationSignableBody(doc as unknown as ModerationAction, board), doc.signature
    )
    return recovered.toLowerCase() === doc.boardAddr.toLowerCase()
  } catch {
    return false
  }
}

/** Latest signed timestamp wins. Equal timestamps prefer delist, then flag;
 * canonical bytes break remaining ties without depending on replication order.
 * Timestamps are board assertions, not independently trusted wall-clock time. */
export function compareModerationActions(a: ModerationAction, b: ModerationAction): number {
  const rank = { endorse: 0, flag: 1, delist: 2 }
  const time = Date.parse(a.timestamp) - Date.parse(b.timestamp)
  if (time) return time
  const severity = rank[a.action] - rank[b.action]
  if (severity) return severity
  const left = canonicalStringify(a)
  const right = canonicalStringify(b)
  return left < right ? -1 : left > right ? 1 : 0
}

/** Reverify at the read boundary as well as in the access controller.
 * Latest verified action per CID — the shared basis for both the delisted
 * set (feed filtering) and a feed-wide trust badge (no entry = unreviewed). */
export function activeModerationByCid(values: unknown[], policy: BoardPolicy): Map<string, ModerationAction> {
  const latest = new Map<string, ModerationAction>()
  for (const value of values) {
    if (!verifyModerationAction(value, policy)) continue
    const previous = latest.get(value.cid)
    if (!previous || compareModerationActions(previous, value) < 0) latest.set(value.cid, value)
  }
  return latest
}

/** Same reduction as activeModerationByCid, re-keyed to commentId and
 * scoped to one article — the shared basis for CommentThread.tsx's
 * delisted-filter and per-comment ModerationBadge. */
export function activeCommentModerationByArticle(
  values: unknown[],
  policy: BoardPolicy,
  articleCid: string
): Map<string, ModerationAction> {
  const byCid = activeModerationByCid(values, policy)
  const byCommentId = new Map<string, ModerationAction>()
  byCid.forEach((action, cid) => {
    const target = parseCommentModerationTarget(cid)
    if (target && target.articleCid === articleCid) byCommentId.set(target.commentId, action)
  })
  return byCommentId
}

export function activeDelistedCids(values: unknown[], policy: BoardPolicy): Set<string> {
  const latest = activeModerationByCid(values, policy)
  return new Set(Array.from(latest.values()).filter((a) => a.action === 'delist').map((a) => a.cid))
}
