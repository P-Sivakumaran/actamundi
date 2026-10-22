// Intentionally empty. This project uses Tailwind CSS v4 via the
// @tailwindcss/vite plugin (vite.config.ts), which handles CSS processing
// directly and needs no PostCSS plugin pipeline. This file exists only to
// shadow actamundi's root postcss.config.js — postcss-load-config searches
// upward for a config and would otherwise pick up the parent project's
// Tailwind v3 + autoprefixer pipeline, double-processing this CSS with the
// wrong Tailwind major version.
module.exports = {
  plugins: {},
}
