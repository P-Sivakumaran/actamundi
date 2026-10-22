/**
 * One OrbitDB "documents" store per wallet, single fixed key (`_id:
 * 'profile'`) since a wallet has exactly one profile — otherwise identical
 * to articles.ts's per-author store role, reusing AuthorAccessController
 * and signing.ts unchanged (see models/P2PProfile.ts's authorAddr note).
 */
import { signableBody, verifyArticleSignatureFor } from './signing'
import type { P2PProfile, P2PProfileInput } from '@/models/P2PProfile'

const PROFILES_DB_PREFIX = 'actamundi.profiles'

interface Signer {
  getAddress(): Promise<string>
  signMessage(message: string): Promise<string>
}

interface ProfileStore {
  put(doc: Record<string, unknown>): Promise<string>
  get(key: string): Promise<{ value: unknown } | undefined>
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean = { ...obj }
  for (const key of Object.keys(clean)) {
    if (clean[key] === undefined) delete clean[key]
  }
  return clean
}

export async function openProfileDB(authorAddr: string): Promise<ProfileStore> {
  // Dynamically imported, not top-level — see follow.ts's identical comment;
  // orbitdb.ts's own module-level useAccessController(AuthorAccessController)
  // call already registers the controller this store needs, no separate
  // registration required here.
  const [{ getOrbitDB }, { AuthorAccessController }] = await Promise.all([
    import('./orbitdb'), import('./access-controller'),
  ])
  const orbit = await getOrbitDB()
  const lower = authorAddr.toLowerCase()
  return orbit.open(`${PROFILES_DB_PREFIX}.${lower}`, {
    type: 'documents',
    AccessController: AuthorAccessController({ authorAddr: lower }),
  }) as Promise<ProfileStore>
}

export async function publishProfile(input: P2PProfileInput, signer: Signer): Promise<P2PProfile> {
  const authorAddr = (await signer.getAddress()).toLowerCase()
  const body = signableBody(input)
  const signature = await signer.signMessage(body)
  const updatedAt = new Date().toISOString()

  const envelope = stripUndefined({ ...input, authorAddr, signature, updatedAt })
  const profile = envelope as unknown as P2PProfile

  const db = await openProfileDB(authorAddr)
  await db.put(stripUndefined({ _id: 'profile', ...envelope }))

  return profile
}

/** Returns null, not a throw, when the wallet hasn't published a profile yet
 * — unlike a missing article (an error condition), most wallets simply
 * start without a profile, so "none yet" is the common/expected state. */
export async function fetchProfile(authorAddr: string): Promise<P2PProfile | null> {
  const db = await openProfileDB(authorAddr)
  const entry = await db.get('profile')
  if (!entry) return null
  const doc = entry.value as Record<string, unknown>
  if (!verifyArticleSignatureFor(doc, authorAddr)) return null
  return doc as unknown as P2PProfile
}
