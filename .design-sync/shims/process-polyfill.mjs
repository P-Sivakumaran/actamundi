// design-sync build shim — not a next/* framework substitute like the
// other files in this directory, but a defensive polyfill for the synth
// entry. components/TruthVerification.tsx reads
// process.env.NEXT_PUBLIC_TRUTH_VERIFICATION_ADDRESS at module top level —
// a normal, correct pattern in the real app (Next.js statically inlines
// NEXT_PUBLIC_* vars at its own build time), but bundle.mjs's esbuild
// `define` only replaces the literal `process.env.NODE_ENV` text pattern,
// so this other process.env.* access survives into the bundle as a real
// runtime `process` reference, which doesn't exist in a browser — crashing
// module evaluation before window.ActaMundi gets populated at all. Must be
// the FIRST `export * from` in the synth entry (see source-kit.mjs fork)
// so ESM's post-order evaluation runs this before any real component's
// top-level code.
if (typeof globalThis.process === 'undefined') {
  globalThis.process = { env: {} };
}
