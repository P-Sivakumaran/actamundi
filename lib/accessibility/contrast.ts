/**
 * WCAG contrast math — the current enforceable standard (2.x's luminance-ratio
 * formula). If a future standard (WCAG 3 / APCA) replaces it, only `contrastRatio`
 * and the AA/AAA thresholds in `meetsWcag` need to change — `hslToRgb` and the
 * token-resolution callers stay the same either way.
 */

export interface Rgb {
  r: number
  g: number
  b: number
}

/** Parses a token's stored "H S% L%" triple (e.g. "180 75% 55%") into RGB. */
export function hslToRgb(hsl: string): Rgb {
  const match = hsl.trim().match(/^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/)
  if (!match) throw new Error(`Not an "H S% L%" triple: "${hsl}"`)
  const h = (parseFloat(match[1]) % 360) / 360
  const s = parseFloat(match[2]) / 100
  const l = parseFloat(match[3]) / 100

  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  }
}

/** WCAG 2.x relative luminance (sRGB -> linear, then the 0.2126/0.7152/0.0722 weights). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const linearize = (channel: number): number => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/** WCAG 2.x contrast ratio, 1 (identical) to 21 (black on white). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const lA = relativeLuminance(a)
  const lB = relativeLuminance(b)
  const lighter = Math.max(lA, lB)
  const darker = Math.min(lA, lB)
  return (lighter + 0.05) / (darker + 0.05)
}

export type WcagLevel = 'AA' | 'AAA'
export type TextSize = 'normal' | 'large'

/** Large text = WCAG's own definition: >=18.66px bold or >=24px regular, which
 * is also what "UI components / graphical objects" (3:1 at AA) are judged against. */
const THRESHOLDS: Record<WcagLevel, Record<TextSize, number>> = {
  AA: { normal: 4.5, large: 3 },
  AAA: { normal: 7, large: 4.5 },
}

export function meetsWcag(ratio: number, level: WcagLevel, size: TextSize): boolean {
  return ratio >= THRESHOLDS[level][size]
}
