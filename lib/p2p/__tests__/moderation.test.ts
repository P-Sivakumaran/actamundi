import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { Wallet } from 'ethers'
import * as dagCbor from '@ipld/dag-cbor'
import { CID } from 'multiformats/cid'
import { sha256 } from 'multiformats/hashes/sha2'
import { BoardAccessController, AuthorAccessController } from '../access-controller'
import { signableBody, verifyArticleSignatureFor } from '../signing'
import {
  moderationSignableBody, verifyModerationAction, activeDelistedCids,
  normalizeBoardPolicy, type ModerationAction,
} from '../moderation-policy'
import { publishModerationAction, createModerationClient } from '../moderation'

const boardA = Wallet.createRandom()
const boardB = Wallet.createRandom()
const outsider = Wallet.createRandom()
const policy = { boardAddrs: [boardA.address, boardB.address], threshold: 1 }
const timestamp = '2026-10-01T00:00:00.000Z'

async function signed(overrides: Partial<Omit<ModerationAction, 'signature'>> = {}, signer = boardA) {
  const cid = CID.createV1(0x55, await sha256.digest(new TextEncoder().encode('article'))).toString()
  const body = { cid, action: 'delist' as const, boardAddr: signer.address, timestamp, ...overrides }
  return { ...body, signature: await signer.signMessage(moderationSignableBody(body, policy)) }
}

test('both board wallets can append signed ADD entries; outsiders and other operations cannot', async () => {
  const ac = await BoardAccessController(policy)()
  for (const signer of [boardA, boardB]) {
    assert.equal(await ac.canAppend({ payload: { op: 'ADD', value: await signed({}, signer) } }), true)
  }
  assert.equal(await ac.canAppend({ payload: { op: 'ADD', value: await signed({}, outsider) } }), false)
  for (const op of ['PUT', 'DEL', undefined]) {
    assert.equal(await ac.canAppend({ payload: { op, value: await signed() } }), false)
  }
  assert.equal(await ac.canAppend({}), false)
})

test('manifest address is stable across board ordering/casing/duplicates, but binds membership', async () => {
  const one = await BoardAccessController(policy)()
  const two = await BoardAccessController({ boardAddrs: [boardB.address.toLowerCase(), boardA.address, boardA.address], threshold: 1 })()
  const other = await BoardAccessController({ boardAddrs: [boardA.address], threshold: 1 })()
  assert.equal(one.address, two.address)
  assert.notEqual(one.address, other.address)
  assert.equal(verifyModerationAction(await signed(), { boardAddrs: [boardA.address], threshold: 1 }), false)
})

test('rejects empty/invalid boards and unsupported multisig thresholds', () => {
  for (const candidate of [
    { boardAddrs: [], threshold: 1 }, { boardAddrs: ['invalid'], threshold: 1 },
    { boardAddrs: ['0x0000000000000000000000000000000000000000'], threshold: 1 },
    { ...policy, threshold: 0 }, { ...policy, threshold: 2 },
  ]) assert.throws(() => normalizeBoardPolicy(candidate))
})

test('DAG-CBOR/key ordering round trips preserve signatures, including optional reason', async () => {
  for (const action of [await signed(), await signed({ reason: 'Evidence contradicts this' })]) {
    const decoded = dagCbor.decode(dagCbor.encode(action))
    assert.equal(verifyModerationAction(decoded, policy), true)
    const reordered = Object.fromEntries(Object.entries(action).reverse())
    assert.equal(verifyModerationAction(reordered, policy), true)
  }
})

test('every semantic field is authenticated, including the target CID and timestamp', async () => {
  const action = await signed({ reason: 'reason' })
  const otherCid = CID.createV1(0x55, await sha256.digest(new TextEncoder().encode('different'))).toString()
  for (const changes of [
    { cid: otherCid }, { action: 'endorse' }, { boardAddr: boardB.address },
    { timestamp: '2026-10-02T00:00:00.000Z' }, { reason: 'modified' }, { signature: '0x00' },
  ]) assert.equal(verifyModerationAction({ ...action, ...changes }, policy), false)
})

test('rejects malformed or extra fields, noncanonical dates/CIDs and undefined reason', async () => {
  const action = await signed()
  for (const value of [null, [], {}, { ...action, cid: 'not-a-cid' },
    { ...action, timestamp: '2026-10-01' }, { ...action, timestamp: 'invalid' },
    { ...action, reason: undefined }, { ...action, reason: 1 }, { ...action, extra: true },
    { ...action, action: 'delete' }, { ...action, signature: undefined },
  ]) assert.equal(verifyModerationAction(value, policy), false)
})

test('last timestamp wins: delist hides, later flag or endorsement restores visibility', async () => {
  const delist = await signed()
  for (const action of ['flag', 'endorse'] as const) {
    const later = await signed({ action, timestamp: '2026-10-02T00:00:00.000Z' }, boardB)
    assert.equal(activeDelistedCids([delist], policy).has(delist.cid), true)
    assert.equal(activeDelistedCids([later, delist], policy).has(delist.cid), false)
    assert.equal(activeDelistedCids([delist, later], policy).has(delist.cid), false)
  }
})

test('equal timestamps prefer delist regardless of arrival order; replay is idempotent', async () => {
  const delist = await signed()
  const endorse = await signed({ action: 'endorse' }, boardB)
  assert.deepEqual(activeDelistedCids([endorse, delist], policy), new Set([delist.cid]))
  assert.deepEqual(activeDelistedCids([delist, endorse, delist], policy), new Set([delist.cid]))
})

test('read boundary ignores outsider/forged moderation and keeps CIDs independent', async () => {
  const delist = await signed()
  const forged = { ...delist, action: 'endorse', timestamp: '2099-01-01T00:00:00.000Z' }
  const outsiderAction = await signed({ action: 'endorse', timestamp: '2099-01-01T00:00:00.000Z' }, outsider)
  const otherCid = CID.createV1(0x55, await sha256.digest(new TextEncoder().encode('other'))).toString()
  const other = await signed({ cid: otherCid, action: 'endorse' })
  assert.deepEqual(activeDelistedCids([delist, forged, outsiderAction, other], policy), new Set([delist.cid]))
})

test('existing author signatures remain valid after CBOR round trips and cannot be moderation signatures', async () => {
  const input = { title: 'Article', slug: 'article', content: 'body', createdAt: timestamp }
  const article = { ...input, authorAddr: boardA.address, signature: await boardA.signMessage(signableBody(input)), cid: 'envelope', updatedAt: timestamp }
  const decoded = dagCbor.decode(dagCbor.encode(article)) as Record<string, unknown>
  assert.equal(verifyArticleSignatureFor(decoded, boardA.address), true)
  const ac = await AuthorAccessController({ authorAddr: boardA.address })()
  assert.equal(await ac.canAppend({ payload: { value: decoded } }), true)
  assert.equal(verifyModerationAction(article, policy), false)
  assert.equal(verifyModerationAction({ ...await signed(), signature: article.signature }, policy), false)
})

test('publishing rejects an unauthorized signer before asking for a signature or opening a store', async () => {
  const previous = process.env.NEXT_PUBLIC_MODERATION_BOARD_ADDRS
  process.env.NEXT_PUBLIC_MODERATION_BOARD_ADDRS = JSON.stringify(policy.boardAddrs)
  try {
    let asked = false
    await assert.rejects(publishModerationAction({ cid: (await signed()).cid, action: 'delist' }, {
      getAddress: async () => outsider.address,
      signMessage: async () => { asked = true; return '0x' },
    }), /not a board member/)
    assert.equal(asked, false)
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_MODERATION_BOARD_ADDRS
    else process.env.NEXT_PUBLIC_MODERATION_BOARD_ADDRS = previous
  }
})

async function memoryLog() {
  const ac = await BoardAccessController(policy)()
  const entries: Array<{ value: unknown }> = []
  const events = new EventEmitter()
  let readError = false
  const store = {
    events,
    all: async () => {
      if (readError) throw new Error('Read failed')
      return [...entries]
    },
    add: async (value: ModerationAction) => {
      const decoded = dagCbor.decode(dagCbor.encode(value))
      if (!await ac.canAppend({ payload: { op: 'ADD', value: decoded } })) throw new Error('Denied')
      entries.push({ value: decoded })
      events.emit('update')
      return String(entries.length)
    },
  }
  const client = createModerationClient(policy, async () => store)
  return { client, store, entries, failReads: (fail: boolean) => { readError = fail } }
}

test('publish/read client omits undefined, authenticates signatures, and returns verified CID history', async () => {
  const { client, entries } = await memoryLog()
  const cid = (await signed()).cid
  const result = await client.publishModerationAction({ cid, action: 'delist', reason: undefined }, boardA)
  assert.equal('reason' in result, false)
  assert.equal(verifyModerationAction(result, policy), true)
  assert.deepEqual(await client.fetchModerationLog(cid), [result])
  // Simulate corrupted storage: the read path must independently reject it.
  entries.push({ value: { ...result, action: 'endorse' } })
  entries.push({ value: await signed({}, outsider) })
  assert.deepEqual(await client.fetchModerationLog(cid), [result])
  assert.deepEqual(await client.fetchModerationLog('unrelated'), [])
  await assert.rejects(client.publishModerationAction({ cid, action: 'flag' }, {
    getAddress: async () => boardA.address,
    signMessage: (body) => outsider.signMessage(body),
  }), /Invalid moderation/)
})

const settle = () => new Promise<void>((resolve) => setImmediate(resolve))

test('subscriptions load initial state, refresh on replicated updates, recover errors, and clean up', async () => {
  const { client, store, failReads } = await memoryLog()
  const delist = await signed()
  await store.add(delist)
  const states: Set<string>[] = []
  const errors: unknown[] = []
  const unsubscribe = await client.subscribeToModeration((state) => states.push(state), (error) => errors.push(error))
  await settle()
  assert.deepEqual(states, [new Set([delist.cid])])
  await store.add(await signed({ action: 'endorse', timestamp: '2026-10-02T00:00:00.000Z' }))
  await settle()
  assert.deepEqual(states[states.length - 1], new Set())
  failReads(true)
  store.events.emit('update')
  await settle()
  assert.equal(errors.length, 1)
  failReads(false)
  await store.add(await signed({ timestamp: '2026-10-03T00:00:00.000Z' }))
  await settle()
  assert.deepEqual(states[states.length - 1], new Set([delist.cid]))
  const count = states.length
  store.events.emit('update')
  unsubscribe()
  await settle()
  assert.equal(store.events.listenerCount('update'), 0)
  assert.equal(states.length, count)
})
