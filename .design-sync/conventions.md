## Building with ActaMundi's components

ActaMundi is a peer-to-peer "reader-owned newspaper" — editorial content signed by author wallets, with a visible endorse/flag/delist moderation trail instead of hidden backend moderation. Trust signals (signature verification, moderation status) are meant to show up inline in the UI, not behind a click.

### Setup

No root provider wrapper is required for visual rendering — colors, spacing, and radii come from plain CSS custom properties already in scope, not from a React context. Two exceptions:

- **Overlay components** (`Dialog`, `Select`, and their sub-parts) are Radix UI primitives — their content only renders when "open." Compose them with `defaultOpen` (Dialog) or the controlled `open` prop (Select) when you need the open state visible, e.g. `<Dialog defaultOpen>…</Dialog>` or `<Select open>…</Select>`.
- **Wallet-dependent components** (`TruthVerification`) render a real, meaningful disconnected/default state with no wallet connected — don't assume you need to mock a wallet provider to use them.

### Styling idiom — semantic Tailwind utilities, not raw hex

Never hardcode a hex color or an arbitrary-value class. Use the semantic color names below — each has a `*-foreground` pairing for text/icon color on top of it:

| Name | Use for |
|---|---|
| `background` / `foreground` | page background / default text |
| `card` / `card-foreground` | card and panel surfaces |
| `popover` / `popover-foreground` | dropdowns, popovers, menus |
| `primary` / `primary-foreground` | the brand teal — primary actions, active states, links |
| `secondary` / `secondary-foreground` | warm-gray neutral — secondary actions |
| `accent` / `accent-foreground` | brand coral — highlights, premium/special states |
| `success` / `warning` / `info` / `destructive` (+ `-foreground`) | feedback and status (endorsed/flagged/error states) |
| `muted` / `muted-foreground` | de-emphasized text and backgrounds |
| `border` / `input` / `ring` | borders, form field borders, focus rings |

Apply as `bg-primary`, `text-muted-foreground`, `border-border`, etc. For a numbered shade (e.g. a gradient stop), the primitive scales are `teal-50…950` (primary's family), `warm-gray-50…950` (secondary/neutral family — also what `gray-*` aliases to), and `coral-50…950` (accent's family) — e.g. `from-teal-500 to-warm-gray-700`.

Merge conditional classes with the `cn()` helper (clsx + tailwind-merge) rather than string-concatenating `className`.

Typography: `font-serif` is Bodoni Moda (headlines, editorial voice — article titles, section headers), `font-sans` is Lato (UI chrome, body text, everything else). Reach for `font-serif` specifically when a piece of text is editorial content a reader is meant to read as "the article," not interface labeling.

### Where the truth lives

- `app/globals.css` — the actual token definitions (`:root` / `.dark`), source of truth for every color above.
- `tailwind.config.js` — how those tokens map to Tailwind's utility classes.
- Each component's own `.prompt.md` in this sync for its specific prop API and examples.

### Example — composing a real screen fragment

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ModerationBadge } from '@/components/ModerationBadge'

<Card className="w-[380px]">
  <CardHeader>
    <CardTitle>Waterfront rezoning</CardTitle>
    <CardDescription>Leaked planning documents show a fast-tracked approval.</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-muted-foreground">
      City council quietly rezoned the waterfront parcel for private development.
    </p>
  </CardContent>
  <CardFooter className="justify-between">
    <ModerationBadge action={moderationAction} />
    <Button size="sm">Read article</Button>
  </CardFooter>
</Card>
```
