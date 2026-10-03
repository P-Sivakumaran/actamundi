# ActaMundi Development Plan

Generated 2026-10-03 via codex (repo analysis, `codex exec -s read-only`) + zev (`zev route`, zero-token cross-check of area tags). No prior roadmap existed in-repo; this is the first version and doubles as the spec source for `/code-review`.

Priority: **P0** blocking, **P1** important, **P2** nice-to-have.

## P0 — blocking

- [x] **[security]** Sanitize article HTML — detail page renders peer-supplied content via `dangerouslySetInnerHTML`; author signatures give no XSS protection. _Done: `404c44e` — DOMPurify at the single render site, codex review clean on first pass._
  _zev cross-check: routed to `p2p` (0.56) instead of `security` — flagged, content originates from p2p replication but the defect is a rendering/sanitization gap. Tag as both._
- [x] **[security]** Secure legacy API routes — MongoDB article mutations and Cloudinary uploads lack route-level auth and ownership checks. _Done: `f5b7ca7` — deleted rather than hardened; zero callers remained after the p2p pivot, so removing is strictly safer than adding auth to dead code._
- [x] **[security]** Lock down administrator bootstrap — `/api/setup` lets the first unauthenticated caller become admin; concurrent setup races possible. _Done: `7d310b3` — SETUP_TOKEN + single-transaction sentinel upsert. Took 5 codex review rounds: naive lock → unrecoverable on crash → un-fenced reclaim allowed concurrent owners → landed on a DB-serialized transaction, which needs no app-level lock at all. See commit body._
- **[p2p]** Implement remote block retrieval and durable replication — only an IndexedDB blockstore exists; announced CIDs don't resolve across browsers, cover images aren't gateway-available.
- [x] **[p2p]** Authenticate article identity and revision ordering — slug-only feed keys and unsigned `updatedAt` allow cross-author replacement and timestamp manipulation. _Cross-author replacement done: `4f24080` — composite authorAddr:slug feed keys, cross-author pubsub filtering for author-scoped views, map reset on scope change. Unsigned `updatedAt` deliberately left as-is: content-addressing already makes stored bytes tamper-evident (can't forge another author's envelope), and the existing "don't regress to an older version" comparison already blocks replaying a stale-but-genuinely-signed revision. Moving `updatedAt` into the signed body would be a wire-format change to `signableBody` touching the whole publish/verify pipeline — worth its own pass, not bundled here._
  _zev cross-check: routed to `security` (0.37) instead of `p2p` — flagged, this is identity/auth-shaped even though the subsystem is p2p. Tag as both._
- **[contracts]** Correct verification settlement and falsehood scoring — settlement counters update more than once; distinct-verifier consensus isn't enforced; a single score of 10 can mark a claim false.

## P1 — important

- **[security]** Keep unpublished drafts private — publishing path signs, replicates, and announces drafts despite hiding them from the feed UI.
  _zev cross-check: routed to `ui` (0.14, low confidence / near-uniform across 7 categories) — likely genuinely cross-cutting (security leak surfaced via UI). Tag as both._
- **[p2p]** Add historical discovery and an aggregate feed — new readers only get live announcements; default subscription covers only `general`.
- **[p2p]** Validate and bound incoming data — signed announcements accept malformed content; no payload limits, fetch-concurrency bounds, or subscription cleanup.
- **[contracts]** Bind claims to article versions — no explicit CID references or chain-specific deployment config; can't separate contract verification from editorial endorsement.
- **[ui]** Complete verification state loading — verification hook only discovers claims via new events; no wallet/network-change handling or listener cleanup.
  _zev cross-check: routed to `contracts` (0.27) instead of `ui` — flagged, the hook's data source is contract events even though the fix is UI-side state management. Tag as both._
- **[moderation]** Build board actions and policy rotation — moderation currently exposes library functions against a fixed, environment-defined board; no authenticated console, no recoverable membership rotation.
- **[infra]** Turn CI into a release gate — `lint-and-build` workflow only installs deps and lints; no build, type-check, contract/moderation test runs, or two-browser publishing tests.
  _zev cross-check: routed to `ui` (0.67, high confidence) — likely a genuine miscategorization risk on zev's part (CI gating publish-flow correctness reads UI-adjacent); keep as `infra`, note for next triage pass._
- **[docs]** Reconcile documentation with implemented architecture — README still describes OrbitDB/Mongo/relay/ownership/deployment behavior that no longer matches the code.

## P2 — nice-to-have

- **[ui]** Improve publishing recovery and mobile preview — editor overhaul still hides live preview below desktop widths; no autosave, no unsaved-change guard, no retry on failed publish.
- **[infra]** `lib/mongodb.ts`'s `withTransaction` helper never passes its `session` into the operations it runs — found while fixing admin bootstrap. Currently unused elsewhere, so nothing's silently broken yet, but it's not usable as-is; fix signature to hand callers the session or remove it.

---

## Workflow note

This plan was produced by a three-party loop:
1. **codex** (`codex exec`, read-only sandbox) — surveyed the repo and drafted prioritized candidate items.
2. **zev** (`zev route`, local zero-token classifier) — cross-checked each item's stated area against its own 7-way classification, flagging disagreements for human review rather than silently trusting either side.
3. **Claude** — synthesized both into this doc, kept zev's disagreements visible instead of resolving them silently.

Low zev confidence (<0.4) is expected and not itself a signal of error — many items are genuinely cross-cutting across a 7-category split. Treat zev's flags as "double-check this tag," not "codex was wrong."
