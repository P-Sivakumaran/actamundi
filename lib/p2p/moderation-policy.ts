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
    if (typeof doc.cid !== 'string' || CID.parse(doc.cid).toString() !== doc.cid) return false
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

export function activeDelistedCids(values: unknown[], policy: BoardPolicy): Set<string> {
  const latest = activeModerationByCid(values, policy)
  return new Set(Array.from(latest.values()).filter((a) => a.action === 'delist').map((a) => a.cid))
}
