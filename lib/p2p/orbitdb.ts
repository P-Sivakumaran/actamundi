/**
 * One OrbitDB "documents" store per author, keyed by wallet address, replaces
 * the single MongoDB `articles` collection. Any peer can reopen an author's
 * log deterministically from the address alone — no server needed to look it up.
 *
 * Requires: npm install @orbitdb/core
 */
import { createOrbitDB, useAccessController, type OrbitDB } from '@orbitdb/core'
import { getP2PNode } from './node'
import { AuthorAccessController } from './access-controller'

useAccessController(AuthorAccessController as any)

let orbitdb: OrbitDB | null = null
let initPromise: Promise<OrbitDB> | null = null

const ARTICLES_DB_PREFIX = 'actamundi.articles'

export function getOrbitDB(): Promise<OrbitDB> {
  if (orbitdb) return Promise.resolve(orbitdb)
  if (initPromise) return initPromise

  initPromise = (async () => {
    const helia = await getP2PNode()
    orbitdb = await createOrbitDB({ ipfs: helia, directory: './actamundi-orbitdb' })
    return orbitdb
  })()

  return initPromise
}

export async function openArticlesDB(authorAddr: string) {
  const db = await getOrbitDB()
  return db.open(`${ARTICLES_DB_PREFIX}.${authorAddr.toLowerCase()}`, {
    type: 'documents',
    AccessController: AuthorAccessController({ authorAddr }),
  })
}
