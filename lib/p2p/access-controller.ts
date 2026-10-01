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
