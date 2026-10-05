// design-sync build config — extends the real tailwind.config.js with one
// extra content path: .design-sync/previews/**/*.tsx. Without this, any
// Tailwind class used ONLY inside an authored preview (not already present
// somewhere in the real app's components/app/lib trees) never makes it into
// the compiled stylesheet cfg.cssEntry points at — classes silently do
// nothing, no build error (e.g. Button's "Special" preview wrapped itself
// in `bg-[#13201f]` to demo the glass-variant button against a dark
// backdrop; that arbitrary-value class was invisible until this was added).
// Does not modify the real tailwind.config.js — purely additive, used only
// by cfg.buildCmd.
const base = require('../tailwind.config.js')

module.exports = {
  ...base,
  content: [...base.content, './.design-sync/previews/**/*.tsx'],
}
