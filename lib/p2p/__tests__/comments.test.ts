import { test } from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { Wallet } from 'ethers'
import * as dagCbor from '@ipld/dag-cbor'
import { SelfSignedAccessController } from '../access-controller'
import { commentSignableBody, verifyComment, reduceComments, type Comment } from '../comments'

const alice = Wallet.createRandom()
const bob = Wallet.createRandom()
const articleCid = 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi'
const timestamp = '2026-10-01T00:00:00.000Z'

async function signed(
  overrides: Partial<Omit<Comment, 'signature'>> = {},
  signer = alice
): Promise<Comment> {
  const body = {
    id: randomUUID(), cid: articleCid, authorAddr: signer.address, body: 'hello', timestamp,
    ...overrides,
  }
  return { ...body, signature: await signer.signMessage(commentSignableBody(body)) }
}

test('any wallet may append a validly self-signed ADD entry scoped to this article', async () => {
  const ac = await SelfSignedAccessController({
    domain: 'actamundi.comments.v1', scope: articleCid, verify: (doc) => verifyComment(doc, articleCid),
  })()
  for (const signer of [alice, bob]) {
    assert.equal(await ac.canAppend({ payload: { op: 'ADD', value: await signed({}, signer) } }), true)
  }
  // signed by alice but claiming to be bob
  const forged = { ...(await signed()), authorAddr: bob.address }
  assert.equal(await ac.canAppend({ payload: { op: 'ADD', value: forged } }), false)
  // valid comment, wrong article's store
  const wrongArticle = await signed({ cid: 'different-article-cid' })
  assert.equal(await ac.canAppend({ payload: { op: 'ADD', value: wrongArticle } }), false)
  for (const op of ['PUT', 'DEL', undefined]) {
    assert.equal(await ac.canAppend({ payload: { op, value: await signed() } }), false)
  }
})

test('DAG-CBOR/key ordering round trips preserve signatures, including optional parentId', async () => {
  for (const action of [await signed(), await signed({ parentId: randomUUID() })]) {
    const decoded = dagCbor.decode(dagCbor.encode(action))
    assert.equal(verifyComment(decoded, articleCid), true)
    const reordered = Object.fromEntries(Object.entries(action).reverse())
    assert.equal(verifyComment(reordered, articleCid), true)
  }
})

test('every field is authenticated', async () => {
  const action = await signed()
  for (const changes of [
    { authorAddr: bob.address }, { body: 'tampered' }, { cid: 'other' },
    { timestamp: '2026-10-02T00:00:00.000Z' }, { signature: '0x00' },
  ]) {
    assert.equal(verifyComment({ ...action, ...changes }, articleCid), false)
  }
})

test('rejects malformed/extra fields, empty non-tombstone body, and oversized body', async () => {
  const action = await signed()
  for (const value of [
    null, [], {}, { ...action, extra: true }, { ...action, body: '' },
    { ...action, timestamp: '2026-10-01' }, { ...action, signature: undefined },
    { ...action, body: 'x'.repeat(5001) },
  ]) {
    assert.equal(verifyComment(value, articleCid), false)
  }
})

test('tombstone with empty body is valid self-signed structure on its own', async () => {
  const tombstone = await signed({ body: '', tombstone: true })
  assert.equal(verifyComment(tombstone, articleCid), true)
})

test('reduceComments: a later tombstone from the SAME author removes the comment', async () => {
  const original = await signed({ timestamp: '2026-10-01T00:00:00.000Z' })
  const tombstone = await signed({ id: original.id, body: '', tombstone: true, timestamp: '2026-10-02T00:00:00.000Z' })
  const result = reduceComments([original, tombstone], articleCid)
  assert.equal(result.length, 0)
})

test('reduceComments: a forged tombstone from a DIFFERENT wallet does not remove the comment', async () => {
  const original = await signed({ timestamp: '2026-10-01T00:00:00.000Z' }, alice)
  // bob validly self-signs a tombstone, but for an id he never authored
  const forgedTombstone = await signed(
    { id: original.id, body: '', tombstone: true, timestamp: '2026-10-02T00:00:00.000Z' },
    bob
  )
  const result = reduceComments([original, forgedTombstone], articleCid)
  assert.equal(result.length, 1)
  assert.equal(result[0].id, original.id)
  assert.equal(result[0].authorAddr.toLowerCase(), alice.address.toLowerCase())
})

test('reduceComments: independent ids are unaffected by each other, sorted by timestamp', async () => {
  const first = await signed({ timestamp: '2026-10-01T00:00:00.000Z' })
  const second = await signed({ timestamp: '2026-10-02T00:00:00.000Z' }, bob)
  const result = reduceComments([second, first], articleCid)
  assert.deepEqual(result.map((c) => c.id), [first.id, second.id])
})

test('reduceComments: outsider entries claiming someone else as author never enter the reduction', async () => {
  const real = await signed()
  const forged = { ...real, id: randomUUID(), authorAddr: bob.address }
  const result = reduceComments([real, forged], articleCid)
  assert.equal(result.length, 1)
})
