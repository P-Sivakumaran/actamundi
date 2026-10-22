/**
 * Custom OrbitDB access controller: write is granted only to entries whose
 * `signature` field recovers to the DB's bound `authorAddr` via ECDSA
 * (see signing.ts) — the same signature publishArticle() already produces.
 * This is deliberately independent of OrbitDB's own identity system: the
 * default IPFSAccessController ties write access to whichever peer's local
 * OrbitDB identity happened to create the DB manifest first, which has no
 * relation to the wallet that's supposed to own the log.
 */
import * as Block from 'multiformats/block'
import * as dagCbor from '@ipld/dag-cbor'
import { sha256 } from 'multiformats/hashes/sha2'
import { base58btc } from 'multiformats/bases/base58'
import { verifyArticleSignatureFor } from './signing'
import { normalizeBoardPolicy, verifyModerationAction, type BoardPolicy } from './moderation-policy'

const type = 'actamundi-author'

interface Entry {
  payload?: { value?: Record<string, unknown> }
}

export const AuthorAccessController =
  ({ authorAddr }: { authorAddr: string }) =>
  async () => {
    const lowerAddr = authorAddr.toLowerCase()

    // Deterministic manifest hash so every peer derives the same DB address
    // for this author without needing to exchange it out of band.
    const { cid } = await Block.encode({
      value: { type, authorAddr: lowerAddr },
      codec: dagCbor,
      hasher: sha256,
    })
    const address = `/${type}/${cid.toString(base58btc)}`

    const canAppend = async (entry: Entry): Promise<boolean> => {
      const doc = entry.payload?.value
      if (!doc) return false
      return verifyArticleSignatureFor(doc, lowerAddr)
    }

    return { type, address, canAppend }
  }

AuthorAccessController.type = type

const boardType = 'actamundi-board-v1'

/** Fixed policy in the manifest: changing membership creates a new log. */
export const BoardAccessController = (policy: BoardPolicy) => {
  const board = normalizeBoardPolicy(policy)
  return async () => {
    const { cid } = await Block.encode({
      value: { type: boardType, ...board }, codec: dagCbor, hasher: sha256,
    })
    return {
      type: boardType,
      address: `/${boardType}/${cid.toString(base58btc)}`,
      canAppend: async (entry: { payload?: { op?: string; value?: unknown } }): Promise<boolean> =>
        entry.payload?.op === 'ADD' && verifyModerationAction(entry.payload.value, board),
    }
  }
}

BoardAccessController.type = boardType

const selfSignedType = 'actamundi-self-signed-v1'

/** Open-membership access controller: any wallet may append an entry, as
 * long as it passes the caller-supplied `verify` predicate (self-signature,
 * schema, domain-specific invariants — e.g. rejecting a self-follow).
 * Unlike AuthorAccessController (one fixed address) or BoardAccessController
 * (one fixed allowlist), follow and comments both need "anyone may write
 * their own signed entry," not a fixed writer set. The controller itself
 * stays generic — it doesn't know whether the entry's self-claimed identity
 * field is called `followerAddr` or `authorAddr`; that's entirely the
 * verify predicate's job, the same way BoardAccessController delegates to
 * verifyModerationAction rather than inlining its checks here. */
export const SelfSignedAccessController = (
  { domain, scope, verify }: { domain: string; scope?: string; verify: (doc: unknown) => boolean }
) =>
  async () => {
    // scope omitted (not set to undefined) when absent — DAG-CBOR rejects
    // `undefined`-valued keys outright, same constraint articles.ts's
    // stripUndefined() works around for stored entries.
    const { cid } = await Block.encode({
      value: scope === undefined
        ? { type: selfSignedType, domain }
        : { type: selfSignedType, domain, scope },
      codec: dagCbor,
      hasher: sha256,
    })
    return {
      type: selfSignedType,
      address: `/${selfSignedType}/${cid.toString(base58btc)}`,
      canAppend: async (entry: { payload?: { op?: string; value?: unknown } }): Promise<boolean> =>
        entry.payload?.op === 'ADD' && verify(entry.payload.value),
    }
  }

SelfSignedAccessController.type = selfSignedType
