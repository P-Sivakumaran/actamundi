import { BoardAccessController } from './access-controller'
import {
  normalizeBoardPolicy, moderationSignableBody, verifyModerationAction,
  activeModerationByCid, activeCommentModerationByArticle, compareModerationActions, MODERATION_DOMAIN,
  type BoardPolicy, type ModerationAction, type ModerationInput,
} from './moderation-policy'

export type { BoardPolicy, ModerationAction, ModerationInput } from './moderation-policy'
export { commentModerationTarget } from './moderation-policy'

interface Signer {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

export interface ModerationStore {
  add(value: ModerationAction): Promise<string>
  all(): Promise<Array<{ value: unknown }>>
  events: {
    on(event: 'update', callback: () => void): void
    off(event: 'update', callback: () => void): void
  }
}

/** Moderation is opt-in per deployment — an instance that never set up a
 * board isn't misconfigured, it just doesn't have moderation yet. Readers
 * shouldn't see env-var plumbing or lose the whole feed over it; callers use
 * this to skip moderation reads entirely rather than racing getModerationPolicy(). */
export function isModerationConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_MODERATION_BOARD_ADDRS
}

export function getModerationPolicy(): BoardPolicy {
  const configured = process.env.NEXT_PUBLIC_MODERATION_BOARD_ADDRS
  if (!configured) throw new Error('NEXT_PUBLIC_MODERATION_BOARD_ADDRS must contain a JSON board address array')
  return normalizeBoardPolicy({ boardAddrs: JSON.parse(configured), threshold: 1 })
}

let opening: Promise<ModerationStore> | undefined

export function openModerationDB(): Promise<ModerationStore> {
  if (!opening) {
    opening = (async () => {
      const policy = getModerationPolicy()
      const [{ getOrbitDB }, { useAccessController }] = await Promise.all([
        import('./orbitdb'), import('@orbitdb/core'),
      ])
      useAccessController(BoardAccessController as any)
      const orbit = await getOrbitDB()
      return orbit.open(MODERATION_DOMAIN, {
        type: 'events', AccessController: BoardAccessController(policy),
      }) as Promise<ModerationStore>
    })().catch((error) => { opening = undefined; throw error })
  }
  return opening
}

/** A policy-bound client; the injected store also permits offline protocol tests. */
export function createModerationClient(policy: BoardPolicy, openStore: () => Promise<ModerationStore>) {
  const board = normalizeBoardPolicy(policy)
  /** The signer and current time supply identity/timestamp; caller supplies intent.
   * Construct an explicit envelope so undefined/extra input fields never hit CBOR. */
  async function publishModerationAction(input: ModerationInput, signer: Signer): Promise<ModerationAction> {
    const policy = board
    const boardAddr = (await signer.getAddress()).toLowerCase()
    if (!policy.boardAddrs.includes(boardAddr)) throw new Error('Signer is not a board member')
    const body = {
      cid: input.cid, action: input.action, boardAddr, timestamp: new Date().toISOString(),
      ...(input.reason === undefined ? {} : { reason: input.reason }),
    }
    const signature = await signer.signMessage(moderationSignableBody(body, policy))
    const action = { ...body, signature }
    if (!verifyModerationAction(action, policy)) throw new Error('Invalid moderation action or signature')
    await (await openStore()).add(action)
    return action
  }

  async function fetchModerationLog(cid: string): Promise<ModerationAction[]> {
    const policy = board
    const entries = await (await openStore()).all()
    return entries.map((entry) => entry.value)
      .filter((value): value is ModerationAction => verifyModerationAction(value, policy) && value.cid === cid)
      .sort(compareModerationActions)
  }

  /** Observe initial state plus local/replicated writes. Serialize refreshes so
   * an older asynchronous snapshot cannot overwrite a newer moderation state.
   * Emits the full latest-action-per-CID map (not just delisted) so callers
   * can show a status badge (endorsed/flagged/unreviewed), not just filter. */
  async function subscribeToModeration(
    onChange: (status: Map<string, ModerationAction>) => void,
    onError: (error: unknown) => void
  ): Promise<() => void> {
    const policy = board
    const db = await openStore()
    let stopped = false
    let pending = Promise.resolve()
    const refresh = () => {
      pending = pending.then(async () => {
        if (stopped) return
        const entries = await db.all()
        const status = activeModerationByCid(entries.map((entry) => entry.value), policy)
        if (!stopped) onChange(status)
      }).catch((error) => { if (!stopped) onError(error) })
    }
    db.events.on('update', refresh)
    refresh()
    return () => { stopped = true; db.events.off('update', refresh) }
  }

  /** Same reduction, scoped to one article's comments and keyed by commentId
   * instead of cid — see activeCommentModerationByArticle. */
  async function fetchCommentModerationLog(articleCid: string): Promise<Map<string, ModerationAction>> {
    const policy = board
    const entries = await (await openStore()).all()
    return activeCommentModerationByArticle(entries.map((entry) => entry.value), policy, articleCid)
  }

  async function subscribeToCommentModeration(
    articleCid: string,
    onChange: (status: Map<string, ModerationAction>) => void,
    onError: (error: unknown) => void
  ): Promise<() => void> {
    const policy = board
    const db = await openStore()
    let stopped = false
    let pending = Promise.resolve()
    const refresh = () => {
      pending = pending.then(async () => {
        if (stopped) return
        const entries = await db.all()
        const status = activeCommentModerationByArticle(entries.map((entry) => entry.value), policy, articleCid)
        if (!stopped) onChange(status)
      }).catch((error) => { if (!stopped) onError(error) })
    }
    db.events.on('update', refresh)
    refresh()
    return () => { stopped = true; db.events.off('update', refresh) }
  }

  return {
    publishModerationAction, fetchModerationLog, subscribeToModeration,
    fetchCommentModerationLog, subscribeToCommentModeration,
  }
}

function configuredClient() {
  return createModerationClient(getModerationPolicy(), openModerationDB)
}

export async function publishModerationAction(input: ModerationInput, signer: Signer): Promise<ModerationAction> {
  return configuredClient().publishModerationAction(input, signer)
}

export async function fetchModerationLog(cid: string): Promise<ModerationAction[]> {
  if (!isModerationConfigured()) return []
  return configuredClient().fetchModerationLog(cid)
}

/** No-configured-board deployments resolve with an empty status map instead
 * of rejecting — moderation is a trust signal layered on top of the feed,
 * not a precondition for the feed existing. */
export async function subscribeToModeration(
  onChange: (status: Map<string, ModerationAction>) => void,
  onError: (error: unknown) => void
): Promise<() => void> {
  if (!isModerationConfigured()) {
    onChange(new Map())
    return () => {}
  }
  return configuredClient().subscribeToModeration(onChange, onError)
}

export async function fetchCommentModerationLog(articleCid: string): Promise<Map<string, ModerationAction>> {
  if (!isModerationConfigured()) return new Map()
  return configuredClient().fetchCommentModerationLog(articleCid)
}

export async function subscribeToCommentModeration(
  articleCid: string,
  onChange: (status: Map<string, ModerationAction>) => void,
  onError: (error: unknown) => void
): Promise<() => void> {
  if (!isModerationConfigured()) {
    onChange(new Map())
    return () => {}
  }
  return configuredClient().subscribeToCommentModeration(articleCid, onChange, onError)
}
