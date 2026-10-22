import { ethers } from 'ethers'
import { canonicalStringify, signableBody } from './signing'

export interface FollowAction {
  followerAddr: string
  followedAddr: string
  action: 'follow' | 'unfollow'
  signature: string
  timestamp: string
}

export type FollowInput = Pick<FollowAction, 'followedAddr' | 'action'>
export const FOLLOW_DOMAIN = 'actamundi.follow.v1'

export function followSignableBody(action: Omit<FollowAction, 'signature'>): string {
  const { followerAddr, followedAddr, timestamp } = action
  return signableBody({ domain: FOLLOW_DOMAIN, followerAddr, followedAddr, action: action.action, timestamp })
}

export function verifyFollowAction(value: unknown): value is FollowAction {
  try {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false
    const doc = value as Record<string, unknown>
    const keys = ['followerAddr', 'followedAddr', 'action', 'signature', 'timestamp']
    if (Object.keys(doc).some((key) => !keys.includes(key))) return false
    if (typeof doc.followerAddr !== 'string' || typeof doc.followedAddr !== 'string') return false
    if (!ethers.isAddress(doc.followerAddr) || !ethers.isAddress(doc.followedAddr)) return false
    // Not a real edge: following yourself is a no-op the UI shouldn't offer
    // and the log shouldn't have to account for when counting followers.
    if (doc.followerAddr.toLowerCase() === doc.followedAddr.toLowerCase()) return false
    if (!['follow', 'unfollow'].includes(doc.action as string)) return false
    if (typeof doc.signature !== 'string') return false
    if (typeof doc.timestamp !== 'string' || new Date(doc.timestamp).toISOString() !== doc.timestamp) return false
    const recovered = ethers.verifyMessage(followSignableBody(doc as unknown as FollowAction), doc.signature)
    return recovered.toLowerCase() === doc.followerAddr.toLowerCase()
  } catch {
    return false
  }
}

/** Latest signed timestamp wins; canonical bytes break ties without
 * depending on replication order (same approach as compareModerationActions,
 * minus a severity ranking — follow/unfollow are mutually exclusive, not graded). */
export function compareFollowActions(a: FollowAction, b: FollowAction): number {
  const time = Date.parse(a.timestamp) - Date.parse(b.timestamp)
  if (time) return time
  const left = canonicalStringify(a)
  const right = canonicalStringify(b)
  return left < right ? -1 : left > right ? 1 : 0
}

function edgeKey(followerAddr: string, followedAddr: string): string {
  return `${followerAddr.toLowerCase()}:${followedAddr.toLowerCase()}`
}

/** Latest verified action per (follower, followed) pair — the shared basis
 * for both "who do I follow" and "who follows this writer" reductions. */
export function activeFollowEdges(values: unknown[]): Map<string, FollowAction> {
  const latest = new Map<string, FollowAction>()
  for (const value of values) {
    if (!verifyFollowAction(value)) continue
    const key = edgeKey(value.followerAddr, value.followedAddr)
    const previous = latest.get(key)
    if (!previous || compareFollowActions(previous, value) < 0) latest.set(key, value)
  }
  return latest
}

export function followingSet(edges: Map<string, FollowAction>, followerAddr: string): Set<string> {
  const lower = followerAddr.toLowerCase()
  const result = new Set<string>()
  for (const action of Array.from(edges.values())) {
    if (action.followerAddr.toLowerCase() === lower && action.action === 'follow') {
      result.add(action.followedAddr.toLowerCase())
    }
  }
  return result
}

export function followerCount(edges: Map<string, FollowAction>, followedAddr: string): number {
  const lower = followedAddr.toLowerCase()
  let count = 0
  for (const action of Array.from(edges.values())) {
    if (action.followedAddr.toLowerCase() === lower && action.action === 'follow') count++
  }
  return count
}
