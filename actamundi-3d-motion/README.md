# ActaMundi — 3D motion, mark & type: implementation

Drop-in code for **P-Sivakumaran/actamundi@main**. Files under `repo/` mirror repo paths.
Copy new files as-is; files ending `.patch.md` describe edits to existing files.
The `design-reference/` folder holds the HTML board these were built from (reference only).

## 1. Install
`npm i three@^0.184.0 && npm i -D @types/three` (see `repo/package.patch.md`).

## 2. Files

| Path | Status | What |
|---|---|---|
| app/motion.css | new | All keyframes/3D classes (`am-*`). Uses existing `--color-*` tokens from globals.css. Includes reduced-motion rules. |
| app/layout.tsx | replace | Adds Newsreader / Instrument Sans / JetBrains Mono, imports motion.css, header mark + wordmark. |
| app/template.tsx | new | Page-turn enter animation on every route change. |
| app/loading.tsx | new | Route-level loading → PageFanLoader. |
| lib/brand/globe.ts | new | Pure three.js builder for the "globe of pages" mark. |
| components/brand/GlobeMark.tsx | new | WebGL mark: fans open once, rests, pauses offscreen. `replayKey` replays. |
| components/ModerationBadge.tsx | replace | Same API; now a rolling prism. Also exports `moderationStatus()`. |
| components/ArticleFeedCard.patch.md | edit | Delisted cards tilt back & dim. |
| components/motion/SignatureFlip.tsx | new | Byline card flips to verified / mismatch. |
| components/motion/LedgerDrop.tsx | new | Publish: hover while signing → stamp → settles onto log. |
| components/motion/WalletCoin.tsx | new | Spins while connecting, lands on connect. |
| components/motion/PageFanLoader.tsx | new | Loading state (CSS echo of the mark). |
| components/motion/EmptyState.tsx | new | Breathing page + CTA slot. |
| tailwind.config.patch.md | edit | New font roles: `display`, `serif`, `sans`, `mono`. |

## 3. Wiring (where each state comes from)

- **SignatureFlip** — article detail byline. Map your signature check
  (TruthVerification / `lib/blockchain.ts` verify) to `'verifying' | 'verified' | 'failed'`.
  `<SignatureFlip author={name} address={article.authorAddr} status={sigStatus} />`
- **ModerationBadge** — no changes at call sites. It animates whenever
  `subscribeToModeration` pushes a new latest action for that CID.
- **LedgerDrop** — admin ArticleForm submit flow: `'signing'` while awaiting
  `signer.signMessage`, `'signed'` once the entry is added to OrbitDB. Then bump
  the header mark's `replayKey` if you want the fan to replay as a reward.
- **WalletCoin** — wherever the wallet connect button lives (`use-wallet-address`):
  `connecting` while `eth_requestAccounts` is pending, `connected` when an address resolves.
- **PageFanLoader** — `app/loading.tsx` (done) plus `use-p2p-articles` loading states
  (`label="Fetching articles from {n} peers…"`).
- **EmptyState** — category pages with zero articles:
  `<EmptyState title="Nothing in Culture yet" description="Be the first to publish — your wallet signs the article." action={<Button size="sm" asChild><Link href="/admin/articles/new">Write an article</Link></Button>} />`
- **GlobeMark (large)** — about / setup / onboarding hero: `<GlobeMark size={480} />`.

## 4. Motion rules (keep these when extending)
1. Animate on **state change only**. The only looping animations are the loaders and the "signing" hover.
2. **Rest on the answer.** The base CSS is the final state; `prefers-reduced-motion` removes animation and shows that state.
3. **CSS 3D for UI, WebGL only for the mark.** The mark renders only while it's moving and pauses when offscreen.
4. Easing: turn `cubic-bezier(.6,0,.2,1)` 600–700ms; roll `cubic-bezier(.7,0,.2,1.25)` 600ms; page enter 460ms.

## 5. Known repo issue (pre-existing, not introduced here)
`tailwind.config.js` maps colors to `hsl(var(--primary))`, `--background` etc., but `globals.css`
defines `--color-primary`, `--color-background`… Unless another stylesheet defines the short names,
classes like `bg-primary` resolve to nothing. motion.css deliberately uses the `--color-*` names.
Aligning the two is a separate one-line-per-token fix.

## 6. Verify
- `npm run dev` → header mark fans open once; navigate between sections → page turn.
- OS "Reduce motion" on → everything renders in final state, no movement.
- `npm run build` → three.js appears in its own chunk.
