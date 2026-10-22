import { SelfSignedAccessController } from './access-controller'
import {
  FOLLOW_DOMAIN, followSignableBody, verifyFollowAction, activeFollowEdges,
  type FollowAction, type FollowInput,
} from './follow-policy'

export type { FollowAction, FollowInput } from './follow-policy'

interface Signer {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

export interface FollowStore {
  add(value: FollowAction): Promise<string>
  all(): Promise<Array<{ value: unknown }>>
  events: {
    on(event: 'update', callback: () => void): void
    off(event: 'update', callback: () => void): void
  }
}

let opening: Promise<FollowStore> | undefined

/** Single global log — bounded by wallet count, not content volume, unlike
 * comments.ts's per-article stores. See lib/p2p/SOCIAL.md. */
export function openFollowDB(): Promise<FollowStore> {
  if (!opening) {
    opening = (async () => {
      // Dynamically imported, not top-level — orbitdb.ts/@orbitdb/core pull
      // in the browser-only p2p stack (see lib/p2p/node.ts), which must
      // never load at module-eval time for a file that could be imported
      // from a server context.
      const [{ getOrbitDB }, { useAccessController }] = await Promise.all([
        import('./orbitdb'), import('@orbitdb/core'),
      ])
      useAccessController(SelfSignedAccessController as any)
      const orbit = await getOrbitDB()
      return orbit.open(FOLLOW_DOMAIN, {
        type: 'events',
        AccessController: SelfSignedAccessController({ domain: FOLLOW_DOMAIN, verify: verifyFollowAction }),
      }) as Promise<FollowStore>
    })().catch((error) => { opening = undefined; throw error })
  }
  return opening
}

export async function publishFollowAction(input: FollowInput, signer: Signer): Promise<FollowAction> {
  const followerAddr = (await signer.getAddress()).toLowerCase()
  const followedAddr = input.followedAddr.toLowerCase()
  const timestamp = new Date().toISOString()
  const body = { followerAddr, followedAddr, action: input.action, timestamp }
  const signature = await signer.signMessage(followSignableBody(body))
  const action: FollowAction = { ...body, signature }
  if (!verifyFollowAction(action)) throw new Error('Invalid follow action or signature')
  await (await openFollowDB()).add(action)
  return action
}

export async function fetchFollowEdges(): Promise<FollowAction[]> {
  const entries = await (await openFollowDB()).all()
  return Array.from(activeFollowEdges(entries.map((entry) => entry.value)).values())
}

/** Observe the full follow graph plus local/replicated writes — same
 * serialized-refresh shape as subscribeToModeration so an older async
 * snapshot can't overwrite a newer one. */
export async function subscribeToFollowGraph(
  onChange: (edges: Map<string, FollowAction>) => void,
  onError: (error: unknown) => void
): Promise<() => void> {
  const db = await openFollowDB()
  let stopped = false
  let pending = Promise.resolve()
  const refresh = () => {
    pending = pending.then(async () => {
      if (stopped) return
      const entries = await db.all()
      const edges = activeFollowEdges(entries.map((entry) => entry.value))
      if (!stopped) onChange(edges)
    }).catch((error) => { if (!stopped) onError(error) })
  }
  db.events.on('update', refresh)
  refresh()
  return () => { stopped = true; db.events.off('update', refresh) }
}
