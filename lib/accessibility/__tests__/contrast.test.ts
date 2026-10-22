import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { hslToRgb, contrastRatio, meetsWcag } from '../contrast'
import { auditPalette, parseTokenBlock, resolveToken } from '../audit-palette'

test('hslToRgb converts known reference colors correctly', () => {
  assert.deepEqual(hslToRgb('0 0% 100%'), { r: 255, g: 255, b: 255 }) // white
  assert.deepEqual(hslToRgb('0 0% 0%'), { r: 0, g: 0, b: 0 }) // black
  assert.deepEqual(hslToRgb('0 100% 50%'), { r: 255, g: 0, b: 0 }) // red
})

test('contrastRatio(white, black) is the maximum, 21:1', () => {
  const ratio = contrastRatio(hslToRgb('0 0% 100%'), hslToRgb('0 0% 0%'))
  assert.ok(Math.abs(ratio - 21) < 0.01, `expected ~21, got ${ratio}`)
})

test('contrastRatio is symmetric regardless of argument order', () => {
  const a = hslToRgb('180 75% 55%')
  const b = hslToRgb('0 0% 100%')
  assert.equal(contrastRatio(a, b), contrastRatio(b, a))
})

test('meetsWcag applies the right threshold per level and text size', () => {
  assert.equal(meetsWcag(4.5, 'AA', 'normal'), true)
  assert.equal(meetsWcag(4.49, 'AA', 'normal'), false)
  assert.equal(meetsWcag(3, 'AA', 'large'), true)
  assert.equal(meetsWcag(6.99, 'AAA', 'normal'), false)
  assert.equal(meetsWcag(7, 'AAA', 'normal'), true)
})

test('resolveToken chases var(--x) indirection to a literal triple', () => {
  const tokens = new Map([
    ['a', 'var(--b)'],
    ['b', 'var(--c)'],
    ['c', '180 75% 55%'],
  ])
  assert.equal(resolveToken(tokens, 'a'), '180 75% 55%')
})

test('resolveToken throws on a circular reference rather than looping forever', () => {
  const tokens = new Map([
    ['a', 'var(--b)'],
    ['b', 'var(--a)'],
  ])
  assert.throws(() => resolveToken(tokens, 'a'))
})

test('parseTokenBlock extracts only the named selector\'s declarations', () => {
  const css = `
    :root { --x: 1 2% 3%; --y: 4 5% 6%; }
    .dark { --x: 7 8% 9%; }
  `
  const root = parseTokenBlock(css, ':root')
  assert.equal(root.get('x'), '1 2% 3%')
  assert.equal(root.get('y'), '4 5% 6%')
  const dark = parseTokenBlock(css, '.dark')
  assert.equal(dark.get('x'), '7 8% 9%')
  assert.equal(dark.has('y'), false) // .dark only overrides what it declares
})

// --- The actual audit: every text/background pair the app renders, against
// the live app/globals.css, both themes. A failure here means a real
// contrast regression shipped, not a hypothetical one. ---

const css = readFileSync(join(__dirname, '../../../app/globals.css'), 'utf8')
const { light, dark } = auditPalette(css)

for (const [themeName, results] of [['light', light], ['dark', dark]] as const) {
  for (const result of results) {
    test(`[${themeName}] ${result.label} (${result.fg} on ${result.bg}) meets WCAG AA`, () => {
      assert.ok(
        result.passesAA,
        `${result.ratio.toFixed(2)}:1 is below the ${result.size === 'large' ? '3:1' : '4.5:1'} ` +
          `AA minimum for ${result.size} text (${result.fg} on ${result.bg}, ${themeName} theme)`
      )
    })
  }
}

test('reports the full contrast table for both themes (always passes — diagnostic output)', () => {
  const format = (label: string, results: typeof light) =>
    results
      .map((r) => `  ${r.passesAA ? '✓' : '✗'} ${r.ratio.toFixed(2)}:1  ${r.fg} on ${r.bg} — ${r.label}`)
      .join('\n')
  console.log(`\nContrast audit — light theme:\n${format('light', light)}`)
  console.log(`\nContrast audit — dark theme:\n${format('dark', dark)}`)
  assert.ok(true)
})
