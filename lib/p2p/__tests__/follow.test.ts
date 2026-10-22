import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Wallet } from 'ethers'
import * as dagCbor from '@ipld/dag-cbor'
import { SelfSignedAccessController } from '../access-controller'
import {
  FOLLOW_DOMAIN, followSignableBody, verifyFollowAction, compareFollowActions,
  activeFollowEdges, followingSet, followerCount, type FollowAction,
} from '../follow-policy'

const alice = Wallet.createRandom()
const bob = Wallet.createRandom()
const carol = Wallet.createRandom()
const timestamp = '2026-10-01T00:00:00.000Z'

async function signed(
  overrides: Partial<Omit<FollowAction, 'signature'>> = {},
  signer = alice
): Promise<FollowAction> {
  const body = {
    followerAddr: signer.address, followedAddr: bob.address, action: 'follow' as const, timestamp,
    ...overrides,
  }
  return { ...body, signature: await signer.signMessage(followSignableBody(body)) }
}

test('any wallet may append a validly self-signed ADD entry; forged signer or other ops cannot', async () => {
  const ac = await SelfSignedAccessController({ domain: FOLLOW_DOMAIN, verify: verifyFollowAction })()
  for (const signer of [alice, bob, carol]) {
    const target = signer === carol ? alice : carol
    const action = await signed({ followerAddr: signer.address, followedAddr: target.address }, signer)
    assert.equal(await ac.canAppend({ payload: { op: 'ADD', value: action } }), true)
  }
  // signed by alice but claiming to be bob
  const forged = { ...(await signed()), followerAddr: bob.address }
  assert.equal(await ac.canAppend({ payload: { op: 'ADD', value: forged } }), false)
  for (const op of ['PUT', 'DEL', undefined]) {
    assert.equal(await ac.canAppend({ payload: { op, value: await signed() } }), false)
  }
  assert.equal(await ac.canAppend({}), false)
})

test('manifest address is stable for the same domain/scope, differs across scopes', async () => {
  const one = await SelfSignedAccessController({ domain: FOLLOW_DOMAIN, verify: verifyFollowAction })()
  const two = await SelfSignedAccessController({ domain: FOLLOW_DOMAIN, verify: verifyFollowAction })()
  const scoped = await SelfSignedAccessController({ domain: FOLLOW_DOMAIN, scope: 'x', verify: verifyFollowAction })()
  assert.equal(one.address, two.address)
  assert.notEqual(one.address, scoped.address)
})

test('rejects a self-follow even when validly signed', async () => {
  const action = await signed({ followedAddr: alice.address })
  assert.equal(verifyFollowAction(action), false)
})

test('DAG-CBOR/key ordering round trips preserve signatures', async () => {
  const action = await signed()
  const decoded = dagCbor.decode(dagCbor.encode(action))
  assert.equal(verifyFollowAction(decoded), true)
  const reordered = Object.fromEntries(Object.entries(action).reverse())
  assert.equal(verifyFollowAction(reordered), true)
})

test('every field is authenticated', async () => {
  const action = await signed()
  for (const changes of [
    { followerAddr: carol.address }, { followedAddr: carol.address },
    { action: 'unfollow' }, { timestamp: '2026-10-02T00:00:00.000Z' }, { signature: '0x00' },
  ]) {
    assert.equal(verifyFollowAction({ ...action, ...changes }), false)
  }
})

test('rejects malformed, extra, or noncanonical fields', async () => {
  const action = await signed()
  for (const value of [
    null, [], {}, { ...action, extra: true }, { ...action, action: 'maybe' },
    { ...action, timestamp: '2026-10-01' }, { ...action, followedAddr: 'not-an-address' },
    { ...action, signature: undefined },
  ]) {
    assert.equal(verifyFollowAction(value), false)
  }
})

test('activeFollowEdges: latest timestamp wins per (follower, followed) pair, independent of other pairs', async () => {
  const follow1 = await signed({ timestamp: '2026-10-01T00:00:00.000Z' })
  const unfollow = await signed({ action: 'unfollow', timestamp: '2026-10-02T00:00:00.000Z' })
  const otherPair = await signed({ followedAddr: carol.address, timestamp: '2026-10-01T00:00:00.000Z' })

  const edges = activeFollowEdges([follow1, unfollow, otherPair])
  assert.equal(edges.size, 2)
  assert.equal(followingSet(edges, alice.address).has(bob.address.toLowerCase()), false)
  assert.equal(followingSet(edges, alice.address).has(carol.address.toLowerCase()), true)
  assert.equal(followerCount(edges, bob.address), 0)
  assert.equal(followerCount(edges, carol.address), 1)
})

test('equal timestamps resolve deterministically via canonical-byte comparison, same on either arrival order', async () => {
  const a = await signed({ timestamp })
  const b = await signed({ action: 'unfollow', timestamp })
  const forward = activeFollowEdges([a, b])
  const backward = activeFollowEdges([b, a])
  assert.deepEqual(forward, backward)
  assert.equal(compareFollowActions(a, b) !== 0, true)
})

test('outsider/forged entries never enter the reduction', async () => {
  const real = await signed()
  const forged = { ...real, followerAddr: carol.address }
  const edges = activeFollowEdges([real, forged])
  assert.equal(edges.size, 1)
})
