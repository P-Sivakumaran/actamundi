/**
 * Resolves app/globals.css's actual custom-property declarations and checks
 * the semantic foreground/background pairs the app renders text on against
 * WCAG contrast thresholds (see contrast.ts). Parses the real file — not a
 * hand-copied snapshot — so a future edit to globals.css is what this checks,
 * not whatever the palette looked like when this list was written.
 */
import { hslToRgb, contrastRatio, meetsWcag, type TextSize } from './contrast'

export type TokenMap = Map<string, string>

/** Extracts `--name: value;` declarations from the first `{...}` block
 * following `selector {` — this file has no nested rules inside :root/.dark,
 * so a non-greedy match to the next `}` is exact, not an approximation. */
export function parseTokenBlock(css: string, selector: string): TokenMap {
  // Comments can contain literal braces (this file has one documenting a
  // Tailwind config snippet) — strip them first so a brace inside a comment
  // can't be mistaken for the block's real closing brace.
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const re = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`)
  const block = withoutComments.match(re)?.[1] ?? ''
  const tokens: TokenMap = new Map()
  const declRe = /--([\w-]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = declRe.exec(block))) {
    tokens.set(m[1], m[2].trim())
  }
  return tokens
}

/** Resolves a token to its literal "H S% L%" triple, chasing `var(--x)`
 * indirection (this file chains primitive -> semantic -> bare-name alias). */
export function resolveToken(tokens: TokenMap, name: string, seen = new Set<string>()): string {
  if (seen.has(name)) throw new Error(`Circular token reference: ${name}`)
  const value = tokens.get(name)
  if (value === undefined) throw new Error(`Undefined token: --${name}`)
  const varMatch = value.match(/^var\(--([\w-]+)\)$/)
  if (!varMatch) return value
  seen.add(name)
  return resolveToken(tokens, varMatch[1], seen)
}

/** [foreground token, background token, human label, WCAG text-size class]. */
export const SEMANTIC_PAIRS: Array<[string, string, string, TextSize]> = [
  ['foreground', 'background', 'body text on the page background', 'normal'],
  ['card-foreground', 'card', 'text inside a Card', 'normal'],
  ['popover-foreground', 'popover', 'text inside a Popover/Select/Dialog', 'normal'],
  ['primary-foreground', 'primary', 'text on a primary button (bg-primary)', 'normal'],
  ['secondary-foreground', 'secondary', 'text on a secondary button', 'normal'],
  ['accent-foreground', 'accent', 'text on an accent-colored element', 'normal'],
  ['success-foreground', 'success', 'text on a success badge/button', 'normal'],
  ['warning-foreground', 'warning', 'text on a warning badge/button', 'normal'],
  ['destructive-foreground', 'destructive', 'text on a destructive button', 'normal'],
  ['info-foreground', 'info', 'text on an info badge/button', 'normal'],
  ['muted-foreground', 'muted', 'muted/secondary text (timestamps, captions)', 'normal'],
  ['muted-foreground', 'background', 'muted text directly on the page background', 'normal'],
]

export interface PairResult {
  label: string
  fg: string
  bg: string
  ratio: number
  size: TextSize
  passesAA: boolean
  passesAAA: boolean
}

export function auditTheme(tokens: TokenMap): PairResult[] {
  return SEMANTIC_PAIRS.map(([fgName, bgName, label, size]) => {
    const fg = hslToRgb(resolveToken(tokens, fgName))
    const bg = hslToRgb(resolveToken(tokens, bgName))
    const ratio = contrastRatio(fg, bg)
    return {
      label,
      fg: `--${fgName}`,
      bg: `--${bgName}`,
      ratio,
      size,
      passesAA: meetsWcag(ratio, 'AA', size),
      passesAAA: meetsWcag(ratio, 'AAA', size),
    }
  })
}

/** `.dark` only overrides some properties — the rest cascade from `:root`,
 * so dark-mode's *effective* tokens are root's merged with dark's overrides. */
export function auditPalette(css: string): { light: PairResult[]; dark: PairResult[] } {
  const rootTokens = parseTokenBlock(css, ':root')
  const darkTokens = parseTokenBlock(css, '.dark')
  const effectiveDark: TokenMap = new Map([...Array.from(rootTokens), ...Array.from(darkTokens)])
  return {
    light: auditTheme(rootTokens),
    dark: auditTheme(effectiveDark),
  }
}
