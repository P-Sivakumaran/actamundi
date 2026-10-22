# Social protocols v1: follow, comments, profile

Three new p2p primitives layered on the existing article/moderation stack
(see `lib/p2p/MODERATION.md` for the prior art these follow).

## Follow — `actamundi.follow.v1`

A single **global** OrbitDB **events** store. Unlike moderation's fixed board
allowlist, follow has **open membership** — any wallet may append its own
follow/unfollow action for any other wallet. `SelfSignedAccessController`
(`lib/p2p/access-controller.ts`) enforces this: it accepts an `ADD` entry iff
the caller-supplied `verify` predicate (here, `verifyFollowAction`) passes —
schema check, self-follow rejection, and a signature that recovers to the
entry's own `followerAddr` field. The controller itself never special-cases
field names; `verify` owns all of that, the same way `BoardAccessController`
delegates to `verifyModerationAction` rather than inlining checks.

A single global log is the right shape here because cardinality is bounded
by **wallet count**, not content volume — a cost that scales with user
growth, not article/comment growth, and every reader benefits from one
shared follow graph (an article's "who follows this writer" or a reader's
"who do I follow" are both derived from the same log).

```ts
await publishFollowAction({ followedAddr, action: 'follow' }, signer)
const edges = await fetchFollowEdges() // latest action per (follower, followed) pair
```

Latest signed timestamp wins per `(followerAddr, followedAddr)` pair;
canonical-byte comparison breaks exact ties, same `compareModerationActions`
shape minus a severity ranking (follow/unfollow are mutually exclusive, not
graded). `activeFollowEdges` is the shared reduction both `followingSet` and
`followerCount` read from.

## Comments — `actamundi.comments.v1.<articleCid>`

**One OrbitDB events store per article**, not a single global log — this is
the one place this phase deliberately diverges from moderation's shape.
Neither OrbitDB store type (`documents` or `events`) supports an indexed or
filtered read; every open store replicates its *entire* history to every
peer that opens it. A global comments log would mean reading one article's
thread replicates every comment ever posted on every article by anyone,
forever — comments are the highest-volume, highest-cardinality write path in
the app, unlike moderation's small-board-bounded log. Keying the store by
the article's own content-address bounds replication cost to "comments on
articles you've actually opened," the cost shape already accepted for the
articles themselves. Stores are opened lazily, on demand, when a reader
visits that article's detail page.

Same `SelfSignedAccessController` primitive as follow, scoped by `articleCid`:

```ts
await publishComment({ cid: articleCid, parentId, body }, signer)
const thread = await fetchComments(articleCid) // flat, verified, tombstones resolved
```

### Tombstones and the trust boundary the access controller can't cover

A delete is a new entry sharing the original comment's `id`, with
`tombstone: true`. `canAppend` only ever sees one entry at a time — it
cannot know who authored some *other* entry sharing that `id`, so a wallet
could validly self-sign a tombstone claiming an `id` it never actually
authored. **The access controller cannot block this; `reduceComments` does.**
For each `id`, the earliest-timestamped valid entry defines the true author;
any later entry (including a tombstone) only takes effect if it's signed by
that same author. A forged tombstone from a different wallet is discarded in
the reduction step, not rejected at write time — it still replicates (the
log is append-only, nothing is truly deleted), it's just never honored when
resolving the thread.

## Profile — `actamundi.profiles.<walletAddr>`

One OrbitDB **documents** store per wallet, single fixed key (`_id:
'profile'`) — otherwise structurally identical to `lib/p2p/articles.ts`'s
per-author store, reusing `AuthorAccessController` and `signing.ts`
unchanged. The profile envelope's identity field is deliberately named
`authorAddr` (not `walletAddr`) so `verifyArticleSignatureFor` and
`AuthorAccessController` work without modification — see
`models/P2PProfile.ts`'s own comment. `fetchProfile` returns `null`, not a
thrown error, when a wallet hasn't published one yet — unlike a missing
article, "no profile" is the common/expected state for most wallets, not a
failure.

## Stats

Article count, follower/following count, comment count are all **derived**
client-side from the stores above — there is no dedicated stats store. A
cached aggregate would just be one more thing that can silently drift from
the real logs, with nothing in this phase to detect that drift.

## Testing

```
npm run test:follow
npm run test:comments
```

Both cover the real signature/access-controller logic with in-memory
fixtures and real DAG-CBOR round trips — self-follow rejection, every-field
authentication, malformed/extra-field rejection, and (comments only) the
tombstone-forgery-across-wallets case described above. Neither suite spins
up a real OrbitDB store or proves live browser replication across peers —
same scope boundary `lib/p2p/MODERATION.md`'s test note already draws.
