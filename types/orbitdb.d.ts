// @orbitdb/core ships no type declarations. Everything that touches it in
// lib/p2p/ is already duck-typed/untyped at the call sites, so this just
// silences the implicit-any error rather than modeling its full API.
declare module '@orbitdb/core' {
  export const createOrbitDB: any;
  export const useAccessController: any;
  export type OrbitDB = any;
}
