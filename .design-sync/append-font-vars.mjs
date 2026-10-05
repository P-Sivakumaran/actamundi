// design-sync build step — appended to cfg.buildCmd after the Tailwind
// compile. tailwind.config.js's fontFamily.serif/sans put
// var(--font-bodoni-moda)/var(--font-lato) FIRST in the stack (the real
// names next/font/google injects at runtime in the actual app). An
// undefined CSS custom property inside var() with no fallback makes the
// WHOLE font-family declaration invalid at computed-value time — not just
// that one comma-separated item — so font-serif/font-sans would resolve to
// nothing at all without this, even though the real font FILES are
// correctly registered via cfg.extraFonts' @font-face rules (fonts-src/fonts.css).
// This is a design-sync-preview-only gap, not a real app bug (next/font
// really does set these at runtime in the actual site) — so it's appended
// here, never written into the real app/globals.css.
import { appendFileSync } from 'node:fs'

const target = process.argv[2]
if (!target) {
  console.error('usage: node append-font-vars.mjs <path-to-compiled-css>')
  process.exit(1)
}

appendFileSync(
  target,
  '\n:root {\n  --font-bodoni-moda: \'Bodoni Moda\';\n  --font-lato: \'Lato\';\n}\n',
)
