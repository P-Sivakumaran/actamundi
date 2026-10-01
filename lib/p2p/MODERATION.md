# Moderation protocol v1

Set `NEXT_PUBLIC_MODERATION_BOARD_ADDRS` to a JSON array of nonzero Ethereum
wallet addresses before building/running the application, for example:

```text
NEXT_PUBLIC_MODERATION_BOARD_ADDRS=["<BOARD_1_ADDRESS>","<BOARD_2_ADDRESS>"]
```

This is explicit reader policy, not secret configuration. Missing/invalid
configuration hides the feed and surfaces an error instead of silently disabling
moderation. All participating peers must use the same board set.

`actamundi.moderation.v1` is an OrbitDB **events** store, an append-only shared
log separate from every author's documents store. Its access-controller manifest
binds the sorted, lowercase, deduplicated board set and threshold. The same set
therefore yields the same store address across peers; a different set yields a
different address. Callers open by name with this policy, not by an untrusted
remote access-controller manifest. A new OrbitDB database implementation is
unnecessary: the existing events type already provides the required semantics.

`BoardAccessController({ boardAddrs, threshold: 1 })` accepts only ADD operations
with a valid moderation envelope signed by one member. Other thresholds throw,
so callers cannot mistake an ignored parameter for multisig enforcement.
M-of-N approval is outside this phase. Per-author access control is unchanged.

```ts
await publishModerationAction({ cid: articleCid, action: 'delist', reason: '...' }, signer)
const history = await fetchModerationLog(articleCid)
```

The publisher supplies the signer address and current ISO UTC timestamp. It
builds an explicit envelope, omitting absent `reason` rather than sending
undefined through DAG-CBOR. The signature uses the existing `signableBody`
canonicalizer with a protocol domain and board policy. **Every action field,
including the target CID, reason, boardAddr, and timestamp, is signed.** Article
envelope stripping cannot be reused here because it would remove the target CID.
Readers validate the schema, membership, and signature again, even after the
access controller has accepted an entry.

## Conflicts and read behavior

The latest signed timestamp for a CID is its active action. A later flag or
endorsement clears a previous delist. At an identical timestamp, delist wins
over flag, and flag over endorse; canonical envelope bytes break remaining
ties. Ordering does not depend on peer arrival order. Replays are idempotent
for visibility, though the history can contain duplicates.

Board timestamps are assertions, not consensus time. A compromised board
wallet can future-date an action; v1 does not use local-clock rejection because
that would make append acceptance differ between peers. Membership and this
single-signature trust model must be understood before using this policy.

The feed hook waits for its local moderation snapshot, filters both returned
`articles` and `filterArticles`, and refreshes when the log changes. It retains
hidden articles locally so later actions can restore them. Read errors hide the
feed until a successful refresh. Direct-CID article retrieval and IPFS content
remain unchanged. No article or author-store entry is deleted.

Like the article network, moderation is eventually consistent. A successful
local read is not proof that all remote actions have replicated; offline peers
can temporarily serve stale results. This phase adds no authoritative sync
checkpoint or availability guarantee.

## Governance boundary

The fixed board policy is configured by the reader/application. Timelock role
changes govern the contract; they do **not** automatically update this OrbitDB
policy. Board rotation needs an explicit policy/log migration and history
decision. There is no implemented chain-to-OrbitDB membership bridge or
timelock delay on moderation writes. Signatures are bound to the board policy,
so changing the policy cannot replay old signatures as newly authorized actions.

Run `npm run test:moderation` from the repository root. Tests cover the real
signature/controller logic and the publish/read/subscription client using an
in-memory store with real DAG-CBOR round trips. They do not prove live browser
replication or React rendering across multiple peers.
