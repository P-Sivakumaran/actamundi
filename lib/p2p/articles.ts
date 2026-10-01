/**
 * Publish / fetch / subscribe over the p2p article log.
 * Replaces app/api/articles/route.ts and app/api/articles/[id]/route.ts.
 */
import { CID } from 'multiformats/cid'
import * as raw from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import { concat } from 'uint8arrays/concat'
import { getP2PNode } from './node'
import { openArticlesDB } from './orbitdb'
import { signableBody, verifyArticleSignature } from './signing'
import type { P2PArticle, P2PArticleInput } from '@/models/P2PArticle'

const TOPIC_PREFIX = 'actamundi.articles'

interface Signer {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

function topicFor(category?: string): string {
  return category ? `${TOPIC_PREFIX}.${category}` : `${TOPIC_PREFIX}.general`
}

async function putBlock(bytes: Uint8Array): Promise<CID> {
  const helia = await getP2PNode()
  const hash = await sha256.digest(bytes)
  const cid = CID.create(1, raw.code, hash)
  await helia.blockstore.put(cid, bytes)
  return cid
}

async function getBlock(cid: string): Promise<Uint8Array> {
  const helia = await getP2PNode()
  // Helia's blockstore yields chunks via an async iterable, not a single
  // Uint8Array — it must be drained and concatenated before decoding.
  const chunks: Uint8Array[] = []
  for await (const chunk of helia.blockstore.get(CID.parse(cid))) {
    chunks.push(chunk)
  }
  return concat(chunks)
}

/** Drops undefined-valued keys — OrbitDB's DAG-CBOR wire encoding rejects
 * `undefined` outright, unlike JSON.stringify which silently omits it. */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean = { ...obj }
  for (const key of Object.keys(clean)) {
    if (clean[key] === undefined) delete clean[key]
  }
  return clean
}

/** Stores an arbitrary blob (e.g. a cover image) as a single raw IPFS block. */
export async function publishBlob(bytes: Uint8Array): Promise<string> {
  const cid = await putBlock(bytes)
  return cid.toString()
}

const DEFAULT_GATEWAY = 'https://ipfs.io/ipfs'

/** Resolves a coverImageCid to an HTTP URL an <img>/<Image> can load. */
export function coverImageUrl(coverImageCid?: string): string | undefined {
  if (!coverImageCid) return undefined
  const gateway = (process.env.NEXT_PUBLIC_IPFS_GATEWAY ?? DEFAULT_GATEWAY).replace(/\/$/, '')
  return `${gateway}/${coverImageCid}`
}

export async function publishArticle(
  input: P2PArticleInput,
  signer: Signer
): Promise<P2PArticle> {
  const authorAddr = await signer.getAddress()
  // Canonical (sorted-key) body: DAG-CBOR, which OrbitDB wire-encodes
  // entries as, doesn't preserve JS key insertion order, so verification
  // after replication must reconstruct the exact string that was signed.
  const body = signableBody(input)
  const signature = await signer.signMessage(body)
  const updatedAt = new Date().toISOString()

  // updatedAt lives in the stored envelope (not in the signed `body`) so
  // fetchArticleByCid can recover it later — it's publish-time metadata,
  // not part of what the author actually signed.
  const envelope = stripUndefined({ ...input, authorAddr, signature, updatedAt })
  const bytes = new TextEncoder().encode(JSON.stringify(envelope))
  const cid = await putBlock(bytes)

  const article: P2PArticle = { ...envelope, cid: cid.toString() } as P2PArticle

  const db = await openArticlesDB(authorAddr)
  // documents store keys off `slug` — this is what makes "publish a new
  // version" an update-in-place from a query perspective while the
  // underlying log entries (and their cids) stay immutable and chained via prevCid
  await db.put(stripUndefined({ _id: article.slug, ...article }))

  const helia = await getP2PNode()
  const pubsub = helia.libp2p.services.pubsub as any
  await pubsub.publish(topicFor(input.category), new TextEncoder().encode(article.cid))

  return article
}

export async function fetchArticleByCid(cid: string): Promise<P2PArticle> {
  const bytes = await getBlock(cid)
  const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>

  // The stored bytes never contain their own cid (it's derived from
  // hashing them — self-reference is circular), so it has to be attached
  // from the identifier the caller already resolved it by.
  const article = { ...parsed, cid } as P2PArticle

  // Pubsub only proves bytes match their announced hash, not who wrote
  // them — anyone can announce a CID pointing at a forged authorAddr/
  // signature pair. Reject anything whose signature doesn't check out
  // before it reaches the feed.
  if (!verifyArticleSignature(article as unknown as Record<string, unknown>)) {
    throw new Error(`Article ${cid} failed signature verification`)
  }

  return article
}

export async function fetchAuthorArticles(authorAddr: string): Promise<P2PArticle[]> {
  const db = await openArticlesDB(authorAddr)
  const all = await db.all()
  return all.map((entry: any) => entry.value as P2PArticle)
}

/**
 * Subscribes to new-article announcements for a category. Callback fires
 * with the announced cid — caller resolves the full article via
 * fetchArticleByCid, which also doubles as tamper-evidence: if the bytes
 * don't hash to the announced cid, IPFS refuses to return them.
 */
export function subscribeToCategory(
  category: string | undefined,
  onNewCid: (cid: string) => void
): () => void {
  let cleanup = () => {}

  getP2PNode().then((helia) => {
    const pubsub = helia.libp2p.services.pubsub as any
    const topic = topicFor(category)

    const handler = (evt: any) => {
      if (evt.detail.topic !== topic) return
      onNewCid(new TextDecoder().decode(evt.detail.data))
    }

    pubsub.addEventListener('message', handler)
    pubsub.subscribe(topic)

    cleanup = () => {
      pubsub.removeEventListener('message', handler)
      pubsub.unsubscribe(topic)
    }
  })

  return () => cleanup()
}
