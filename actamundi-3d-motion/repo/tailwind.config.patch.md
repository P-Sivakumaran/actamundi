# tailwind.config.js — type pairing

Replace `theme.extend.fontFamily`:

```js
fontFamily: {
  display: ['var(--font-bodoni-moda)', 'Bodoni Moda', 'Georgia', 'serif'],      // masthead / wordmark only
  serif:   ['var(--font-newsreader)', 'Newsreader', 'Georgia', 'serif'],        // headlines + article body
  sans:    ['var(--font-instrument-sans)', 'Instrument Sans', 'system-ui', 'sans-serif'], // UI
  mono:    ['var(--font-mono)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
},
```

In `theme.extend.typography.DEFAULT.css`, change the `h1`–`h4` `fontFamily` from
`'var(--font-bodoni-moda), Bodoni Moda, Georgia, serif'` to
`'var(--font-newsreader), Newsreader, Georgia, serif'`, and add body copy:

```js
p: { fontFamily: 'var(--font-newsreader), Newsreader, Georgia, serif' },
```

Every existing `font-serif` headline switches to Newsreader automatically. Use
`font-display` (or the `.am-wordmark` class) only for the masthead.
