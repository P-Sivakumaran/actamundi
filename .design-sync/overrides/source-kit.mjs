// Non-storybook `package` adapter. Bundles dist/ when present (the authoritative
// component list comes from shipped .d.ts; with no dist it synthesizes an
// entry from src/ as a last resort) and opportunistically enriches each
// component from src/ — JSDoc and dir-derived group. Every enrichment miss
// degrades to the plain-dist behaviour.
//
// Discovery is heuristic-based; each heuristic has a `.design-sync/config.json`
// override (ASSUMPTION comments below name them) so repos that don't match the
// defaults write config, not code. `componentSrcMap` is the single override
// knob for component inclusion: non-null value = add/pin src path, null =
// exclude a .d.ts-exported internal.

// forked from design-sync lib/source-kit.mjs — the sole reason for this
// fork is the final import line below: this file's static `from './dts.mjs'`
// import bypasses package-build.mjs's override-aware loadLib() loader, so
// the component-discovery findTypesRoot fix in .design-sync/overrides/dts.mjs
// (see its header) never took effect here — exportedNames() inside
// resolvePackage() kept reading actamundi's unrelated repo-root types/
// (ambient declaration augmentation) instead of falling through to the
// synth content-scan. Copying this file into overrides/ makes its relative
// `./dts.mjs` resolve to the sibling fork automatically; `./common.mjs` and
// `./bundle.mjs` are repointed at the staged (unforked) lib per the
// skill's own fork convention — this file changes nothing else.
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { Project, Node, ts } from 'ts-morph';
import { leadingJsdoc, readText, slash, walk } from '../../.ds-sync/lib/common.mjs';
import { resolveDistEntry } from '../../.ds-sync/lib/bundle.mjs';
import { exportedNames, isComponentName } from './dts.mjs';

const NON_IMPL_RX = /\.(stories|test|spec)\./;
const SRC_IMPL_RX = /\.(tsx|jsx)$/;
// Dir names that don't usefully group components — skip so the emitted path
// is `components/<group>/<Name>` not `components/components/<Name>`.
const GENERIC_DIR = new Set(['components', 'component', 'src', 'lib', 'ui', 'packages', 'react']);
const slug = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'general';

// No .d.ts → scan src files for PascalCase value exports via ts-morph.
function deriveComponentsFromSrc(srcFiles) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, allowJs: true, skipLibCheck: true },
  });
  const seen = new Set();
  for (const p of srcFiles) {
    if (NON_IMPL_RX.test(p) || !SRC_IMPL_RX.test(p)) continue;
    const sf = project.addSourceFileAtPathIfExists(p);
    if (!sf) continue;
    for (const [name, decls] of sf.getExportedDeclarations()) {
      // `export default function Button()` is keyed as 'default' — recover
      // the declared name from the function/class node.
      const real = name === 'default'
        ? decls.map((d) => d.getName?.()).find((n) => n && n !== 'default')
        : name;
      if (!real || !/^[A-Z][A-Za-z0-9]*$/.test(real)) continue;
      if (decls.some((d) => Node.isVariableDeclaration(d) || Node.isFunctionDeclaration(d) || Node.isClassDeclaration(d))) {
        seen.add(real);
      }
    }
  }
  return [...seen].sort().map((name) => ({ name, group: 'general' }));
}

// actamundi fork addition — see the entry-generation call site for why:
// `export * from` never forwards a default export, so synth-entry
// generation needs to know, per file, whether its component is exported as
// `export default function Name()` so it can emit an explicit
// `export { default as Name } from <path>` instead. Returns the recovered
// name, or null if the file has no default export (or isn't a component).
function defaultExportName(filePath) {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { jsx: ts.JsxEmit.Preserve, allowJs: true, skipLibCheck: true },
  });
  const sf = project.addSourceFileAtPathIfExists(filePath);
  if (!sf) return null;
  const decls = sf.getExportedDeclarations().get('default');
  if (!decls) return null;
  const real = decls.map((d) => d.getName?.()).find((n) => n && n !== 'default');
  return real && /^[A-Z][A-Za-z0-9]*$/.test(real) ? real : null;
}

export async function resolvePackage(ctx) {
  const { PKG_DIR, pkgJson, ENTRY_OVERRIDE, PKG, OUT, cfg } = ctx;
  const srcMap = cfg.componentSrcMap ?? {};

  // ── 1. src/ discovery (best-effort; feeds enrichment + synth-entry fallback).
  // ASSUMPTION: source root is first of src/ | lib/ | components/. Override: cfg.srcDir.
  const srcRoot = [cfg.srcDir, 'src', 'lib', 'components']
    .map((d) => d && resolve(PKG_DIR, d))
    .find((d) => d && existsSync(d));
  const srcFiles = srcRoot ? walk(srcRoot, (n) => /\.(tsx|jsx|mdx?)$/.test(n)) : [];

  // ── 2. entry: dist if it exists, else synthesize from src/ (last resort).
  let entry = resolveDistEntry({ pkgDir: PKG_DIR, pkgJson, override: ENTRY_OVERRIDE, pkgName: PKG, soft: true });
  let synthEntry = false;
  if (!entry) {
    if (!srcRoot) {
      console.error(`[NO_DIST] ${PKG} has no built entry and no src/ to synthesize from — run its build.`);
      process.exit(1);
    }
    // actamundi fork: components/truth-verification/TruthVerification.tsx is
    // unused dead code (see .design-sync/NOTES.md) that duplicates the name
    // "TruthVerification" from the real, imported components/TruthVerification.tsx.
    // Blindly `export *`-ing both makes the name AMBIGUOUS per the ES module
    // spec — ambiguous star re-exports are silently dropped, not an error —
    // so window.ActaMundi.TruthVerification ended up undefined even though
    // cfg.componentSrcMap correctly pins the metadata/preview to the real
    // file. Must exclude the duplicate from the entry file list itself, not
    // just from the discovered-names Set (componentSrcMap only affects the
    // latter).
    const DUPLICATE_FILES = new Set([
      resolve(PKG_DIR, 'components/truth-verification/TruthVerification.tsx'),
    ]);
    const comps = srcFiles.filter(
      (p) => SRC_IMPL_RX.test(p) && !NON_IMPL_RX.test(p) && !DUPLICATE_FILES.has(resolve(p)),
    );
    entry = join(OUT, '.pkg-entry.mjs');
    // actamundi fork: `export * from <path>` never re-exports a DEFAULT
    // export — that's ES module spec, not a bug — so any component whose
    // file uses `export default function Name()` (ArticleSearch.tsx,
    // RichTextEditor.tsx) was correctly DISCOVERED by deriveComponentsFromSrc
    // (which does inspect default exports) but silently absent from the
    // actual bundle. defaultExportName() below runs the same ts-morph
    // inspection per-file so the entry can emit an explicit
    // `export { default as Name } from <path>` for just those files,
    // alongside the blind `export *` every other (named-export) file uses.
    const exportLines = comps.map((p) => {
      const def = defaultExportName(p);
      return def ? `export { default as ${def} } from ${JSON.stringify(p)};` : `export * from ${JSON.stringify(p)};`;
    });
    // actamundi fork: a globalThis.process polyfill goes FIRST — see
    // .design-sync/shims/process-polyfill.mjs header. It has zero imports
    // of its own, so ESM's post-order dependency evaluation runs it before
    // any real component's top-level code, however the components are
    // later reordered/batched.
    const polyfill = resolve(PKG_DIR, '.design-sync/shims/process-polyfill.mjs');
    exportLines.unshift(`export * from ${JSON.stringify(polyfill)};`);
    writeFileSync(entry, exportLines.join('\n') + '\n');
    synthEntry = true;
    console.error(
      `[NO_DIST] no built entry — synthesizing from ${comps.length} src files (run the package's build for best results)`,
    );
  }

  // ── 3. component list: from shipped .d.ts (authoritative when dist exists).
  // ASSUMPTION: components = PascalCase value exports in the .d.ts tree.
  // Override: cfg.componentSrcMap (non-null adds/pins, null excludes).
  const exported = exportedNames(PKG_DIR, pkgJson);
  const names = new Set([...exported].filter(isComponentName));
  for (const [k, v] of Object.entries(srcMap)) {
    if (v === null) { names.delete(k); continue; }
    // Names reach `<script>` blocks in the emitted HTML — reject anything
    // that isn't a plain PascalCase identifier.
    if (!/^[A-Z][A-Za-z0-9]*$/.test(k)) {
      console.error(`[CONFIG] componentSrcMap: "${k}" is not a valid component name (PascalCase identifiers only)`);
      continue;
    }
    names.add(k);
  }
  let components = [...names].sort().map((name) => ({ name, group: 'general' }));
  // actamundi fork: upstream only ran the synth content-scan when `components`
  // was EMPTY (components.length === 0) — i.e. truly nothing came from
  // exportedNames()/.d.ts. But cfg.componentSrcMap's "non-null adds" side
  // effect (line ~105, names.add(k)) means pinning even ONE name (here,
  // TruthVerification, to disambiguate two same-named files) makes
  // components.length === 1, which silently skipped the synth scan for
  // every OTHER real component in components/*.tsx — this repo has no dist/
  // .d.ts at all, so synth-entry mode should always run deriveComponentsFromSrc
  // when synthEntry is true, unioned with whatever componentSrcMap adds/pins,
  // not gated on the .d.ts-derived set happening to be empty.
  if (synthEntry) {
    const derived = deriveComponentsFromSrc(srcFiles).filter((c) => srcMap[c.name] !== null);
    const byName = new Map(derived.map((c) => [c.name, c]));
    for (const c of components) byName.set(c.name, c);
    components = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (!components.length) {
    if (cfg.cssEntry || existsSync(join(PKG_DIR, 'styles.css'))) {
      console.error('[ZERO_MATCH] no component exports — treating as tokens-only DS');
      return { shape: 'package', entry, components: [], tokensOnly: true };
    }
    console.error(`[ZERO_MATCH] no PascalCase exports in ${PKG} and no styles — nothing to sync`);
    process.exit(1);
  }

  // ── 4. src/ enrichment per component. Every miss degrades to plain-dist.
  if (srcRoot) {
    for (const c of components) {
      // Pinned via config → skip fuzzy-find entirely.
      let hit = typeof srcMap[c.name] === 'string' ? slash(resolve(PKG_DIR, srcMap[c.name])) : null;
      if (!hit) {
        // ASSUMPTION: <Name>.tsx | <name>/<name>.tsx | <Name>/index.tsx |
        // <kebab-name>.tsx, case-insensitive; dir-match ranks above
        // bare-file match, then prefer one that actually exports `c.name`.
        // Override: cfg.componentSrcMap.
        const kebab = c.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2');
        const nameRx = new RegExp(
          `(?:^|/)(?:${c.name}/(?:index|${c.name})\\.(tsx|jsx)|(?:${c.name}|${kebab})\\.(tsx|jsx))$`,
          'i',
        );
        const hits = srcFiles
          .filter((p) => nameRx.test(p) && !NON_IMPL_RX.test(p))
          .sort(
            (a, b) =>
              (b.toLowerCase().includes(`/${c.name.toLowerCase()}/`) ? 1 : 0) -
              (a.toLowerCase().includes(`/${c.name.toLowerCase()}/`) ? 1 : 0),
          );
        const exportRx = new RegExp(`export\\s+(?:default\\s+)?(?:const|let|var|function|class)\\s+${c.name}\\b`);
        hit = hits.find((p) => exportRx.test(readText(p))) ?? hits[0];
      }
      if (!hit || !existsSync(hit)) continue;
      c.srcPath = hit;
      c.doc = leadingJsdoc(readText(hit), c.name) || undefined;
      // group = last src/ path segment that isn't the component's own dir or
      // a generic container name — else JSDoc @category — else 'general'.
      c.group = slug(
        slash(relative(srcRoot, dirname(hit)))
          .split('/')
          .filter((s) => s && s.toLowerCase() !== c.name.toLowerCase() && !GENERIC_DIR.has(s.toLowerCase()))
          .at(-1)
        || (c.doc && /@category\s+(\S+)/.exec(c.doc)?.[1])
        || 'general',
      );
    }
  }

  console.error(
    `  package: ${components.length} components` +
      (srcRoot ? ` (${components.filter((c) => c.srcPath).length} src-matched)` : ' (no src/ — dist-only)'),
  );
  return { shape: 'package', entry, components, synthEntry, exported };
}
