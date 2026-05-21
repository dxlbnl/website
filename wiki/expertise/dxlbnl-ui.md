# @dxlbnl/ui component library

Dexterlabs' own Svelte 5 component library. Phosphor (dark) and Paper (light) palettes,
JetBrains Mono + Inter Tight typefaces, amber primary accent, terminal/hardware aesthetic.

Full docs at `../dxlb-ui/docs/` (relative to this project root). This page is a dense
agent reference — read it instead of `node_modules/`.

## Import path

```ts
import { ComponentName } from '@dxlbnl/ui'
```

All components and the `toast` store export from this single entry point.

## Global CSS (already set up in this project)

`src/app.css` already imports the tokens. Do not re-add these.

```css
@import '@dxlbnl/ui/tokens/tokens.css';
```

## Palette

Two palettes — Phosphor (dark, default) and Paper (light).

```ts
document.documentElement.setAttribute('data-palette', 'paper')    // light
document.documentElement.setAttribute('data-palette', 'phosphor') // dark
```

`Nav` includes a built-in toggle. Initial server render is always Phosphor (SSR caveat — expected).

---

## Layout components

```ts
import { Stack, Inline, Spread, Grid, Container, Rule, Prose } from '@dxlbnl/ui'
```

### Stack — vertical flex column

```svelte
<Stack gap="md">          <!-- gap: none | xs | sm | md | lg | xl -->
  <p>Item</p>
</Stack>
```

`sm` and `md` both resolve to `--u2` (16px). Use `as="section"` etc. for semantics.

### Inline — horizontal flex row, wrapping

```svelte
<Inline gap="xs">
  <Led color="ok" />
  <span>Label</span>
</Inline>
```

Always `flex-wrap: wrap` and `align-items: center`.

### Spread — space-between row

```svelte
<Spread>
  <span>Left</span>
  <Button>Right</Button>
</Spread>
```

Fixed gap `--u2`. No `gap` prop.

### Grid — CSS grid

```svelte
<Grid cols={3} gap="md">...</Grid>
<Grid cols="auto" minColWidth="240px" gap="sm">...</Grid>
```

`cols="auto"` → `repeat(auto-fill, minmax(minColWidth, 1fr))`.

### Container — centred max-width wrapper

```svelte
<Container size="lg">...</Container>  <!-- lg=1440px, md=960px, sm=640px -->
```

Horizontal padding: 32px (≥720px), 16px (<720px). Sets `container-type: inline-size`.

### Rule — horizontal divider

```svelte
<Rule />
<Rule variant="dashed" />
<Rule variant="strong" />
```

`solid` uses `--rule`; `dashed` uses `--rule` dashed; `strong` uses `--rule-strong`.

### Prose — markdown wrapper

```svelte
<Prose maxWidth="72ch">
  <!-- mdsvex HTML output -->
</Prose>
```

Styles `h1`–`h4`, `p`, `a`, `code`, `pre`, `blockquote`, `table`, `img`, `hr` via `:global`.

---

## Primitives

```ts
import { Button, Led, TagPill, Text, Heading } from '@dxlbnl/ui'
```

### Button

```svelte
<Button variant="primary">Buy Now</Button>         <!-- amber fill -->
<Button variant="cta">Pre-order</Button>            <!-- amber outline -->
<Button variant="ghost">See all →</Button>          <!-- amber text only -->
<Button variant="back">← Back</Button>              <!-- muted nav -->
<Button variant="del">Remove</Button>               <!-- small danger pill -->
<Button as="a" href="/shop" variant="primary">Shop</Button>
```

### Led — 7×7px status dot

```svelte
<Led color="ok" />        <!-- green glow -->
<Led color="amber" />     <!-- amber glow -->
<Led color="cyan" />
<Led color="danger" />    <!-- red glow -->
<Led color="off" />       <!-- no glow -->
<Led color="amber" blink />  <!-- stepped 1.6s blink -->
```

Always has `role="status"`. Add `aria-label` when meaningful, `aria-hidden="true"` when decorative.

### TagPill

```svelte
<TagPill>SvelteKit</TagPill>
<TagPill variant="amber">In Stock</TagPill>
<TagPill variant="cyan">Eurorack</TagPill>
```

Square corners, 11px uppercase mono.

### Text

```svelte
<Text>Body text.</Text>
<Text variant="lede">Lead paragraph.</Text>
<Text variant="mono" color="faint">META · LABEL</Text>
<Text variant="eyebrow" color="amber">Category</Text>
```

`color` values: `ink | dim | faint | amber | cyan | ok | danger`. Zero CSS of its own — delegates to global typography classes.

### Heading

```svelte
<Heading>Section Title</Heading>                     <!-- h2, h2 class -->
<Heading level={1} variant="display">DEXTERLABS</Heading>
<Heading level={1} variant="hero">Build Hardware</Heading>
<Heading level={1} variant="title">Order cancelled.</Heading>
<Heading level={3} color="amber">Module Status</Heading>
```

`variant`: `display` (140px) | `hero` (fluid 48–112px) | `title` (fluid 36–56px) | `h1` | `h2` | `h3`.

---

## Patterns

```ts
import { PageHero, SectionHead, SectionFoot, ActivityRow, StatCard, KvList, ProgressBar, Alert, CtaBlock } from '@dxlbnl/ui'
```

### PageHero — full-width page header

```svelte
<!-- String form -->
<PageHero
  eyebrow="// ADMIN · ORDERS"
  heading="Orders."
  lede="Optional lead paragraph."
  border
>
  <Button variant="primary">Action</Button>
</PageHero>

<!-- Snippet form for rich eyebrow/heading -->
{#snippet eyebrow()}
  <Inline gap="xs"><Led color="amber" /><Text variant="eyebrow">LIVE</Text></Inline>
{/snippet}
<PageHero {eyebrow} heading="Dashboard." />
```

`variant`: `"title"` (default, 36–56px) | `"hero"` (48–112px). `border` adds a `--rule` bottom border.

### SectionHead

```svelte
<SectionHead eyebrow="Catalogue" heading="Modules" sublabel="12 items">
  <Button variant="ghost">Filter</Button>
</SectionHead>
```

Renders as `<section>` with `border-bottom: 1px solid var(--rule)`.

### SectionFoot

```svelte
<SectionFoot href="/shop" label="View all modules" count={12} meta="in stock" />
```

### ActivityRow — log entry with timestamp + LED

```svelte
<ActivityRow timestamp="14:32:01" description="Deploy complete" status="ok" />
<ActivityRow timestamp="14:31:44" actor="ci-bot" description="Build started" status="amber" />
```

`status`: `ok | amber | danger | off`.

### StatCard

```svelte
<StatCard label="Units sold" value="142" sublabel="last 30 days" />
<StatCard label="Error rate" value="2.4%" color="danger" />
```

### KvList

```svelte
<KvList items={[
  { key: 'Status', value: 'Online', color: 'ok' },
  { key: 'Firmware', value: 'v1.4.2' },
]} />
```

### Alert

```svelte
<Alert variant="info">System notice.</Alert>
<Alert variant="warning">Check config.</Alert>
<Alert variant="danger">Payment failed.</Alert>
```

---

## Cards

```ts
import { Card, ProductCard, ProjectCard, NoteCard } from '@dxlbnl/ui'
```

See `../dxlb-ui/docs/cards.md` for full prop reference.

---

## Navigation

```ts
import { Nav, Breadcrumb } from '@dxlbnl/ui'
```

`Nav` includes the built-in palette toggle. See `../dxlb-ui/docs/navigation.md`.

---

## Forms

```ts
import { Input, Textarea, Select, InputWrap, Field, Checkbox, Radio, RadioGroup, Switch } from '@dxlbnl/ui'
```

See `../dxlb-ui/docs/forms.md` for full prop reference.

---

## Feedback

```ts
import { Modal, Toast, ToastRegion, toast } from '@dxlbnl/ui'
```

`toast.success('Done')`, `toast.error('Failed')`. Mount `<ToastRegion />` once in the root layout.

---

## Design tokens (key subset)

| Token | Phosphor | Paper | Meaning |
|---|---|---|---|
| `--bg` | `#0b0d0c` | `#efece4` | Page background |
| `--bg-rail` | `#0f1211` | `#e6e2d6` | Cards, nav |
| `--bg-elev` | `#141817` | `#f5f2ea` | Elevated surfaces |
| `--ink` | `#d6e2dc` | `#14110b` | Primary text |
| `--ink-dim` | `#a4b0a9` | `#3f3b30` | Secondary text |
| `--ink-faint` | `#7a8580` | `#5f5a4a` | Metadata, tertiary |
| `--rule` | `#1d2321` | `#cfcabc` | Default borders |
| `--rule-strong` | `#2a3330` | `#a8a192` | Emphasised borders |
| `--amber` | `#ffb347` | `#a04e00` | Primary accent |
| `--cyan` | `#7cc7d1` | `#030304` | Secondary accent |
| `--danger` | `#ff7a6b` | `#a83224` | Error |
| `--ok` | `#8fd48a` | `#356b31` | Success |
| `--mono` | JetBrains Mono stack | — | Monospace font |
| `--sans` | Inter Tight stack | — | Sans-serif font |
| `--t-micro` | `12px` | — | Timestamps, pills |
| `--t-mono` | `14px` | — | Labels, table cells |
| `--t-body` | `16px` | — | Body prose |
| `--u` | `8px` | — | Base spacing unit |
| `--u2` | `16px` | — | 2× unit |
| `--u4` | `32px` | — | 4× unit |
| `--u5` | `40px` | — | 5× unit |
| `--radius` | `2px` | — | Buttons, pills |
| `--radius-card` | `4px` | — | Cards |

Full token reference: `../dxlb-ui/docs/design-tokens.md`.
