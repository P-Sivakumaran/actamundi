/**
 * Shared canonicalization for the wallet-signature scheme used by
 * publishArticle() (signs) and access-controller.ts / articles.ts (verify).
 *
 * OrbitDB entries are wire-encoded as DAG-CBOR, which does not preserve
 * JS object key insertion order. A signature computed over a plain
 * `JSON.stringify(input)` at publish time will not match a `JSON.stringify`
 * of the same object reconstructed after it round-trips through DAG-CBOR
 * decode on another peer — the keys come back in a different order. Sorting
 * keys before stringifying makes the signed string independent of
 * insertion/encoding order on both ends.
 */
import { ethers } from 'ethers'

// Fields publishArticle() appends to `input` after signing it — stripping
// them off a stored document reconstructs the object that was signed.
const SIGNED_ENVELOPE_KEYS = ['_id', 'cid', 'authorAddr', 'signature', 'updatedAt']

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep)
  if (value !== null && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = sortKeysDeep((value as Record<string, unknown>)[key])
        return acc
      }, {})
  }
  return value
}

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(sortKeysDeep(value))
}

/** The string publishArticle() signs for a given P2PArticleInput. */
export function signableBody(input: Record<string, unknown>): string {
  return canonicalStringify(input)
}

/** Reconstructs the signed string from a stored/replicated document. */
function envelopeBody(doc: Record<string, unknown>): string {
  const clone: Record<string, unknown> = { ...doc }
  for (const key of SIGNED_ENVELOPE_KEYS) delete clone[key]
  return canonicalStringify(clone)
}

/** Verifies doc.signature recovers to doc.authorAddr. */
export function verifyArticleSignature(doc: Record<string, unknown>): boolean {
  if (typeof doc.signature !== 'string' || typeof doc.authorAddr !== 'string') {
    return false
  }
  try {
    const recovered = ethers.verifyMessage(envelopeBody(doc), doc.signature)
    return recovered.toLowerCase() === doc.authorAddr.toLowerCase()
  } catch {
    return false
  }
}

/** Verifies doc.signature recovers to a specific expected author address. */
export function verifyArticleSignatureFor(
  doc: Record<string, unknown>,
  expectedAuthorAddr: string
): boolean {
  if (
    typeof doc.authorAddr !== 'string' ||
    doc.authorAddr.toLowerCase() !== expectedAuthorAddr.toLowerCase()
  ) {
    return false
  }
  return verifyArticleSignature(doc)
}
