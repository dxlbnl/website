---
id: REG-nav-2026-05-20
title: "Regression — Nav must externalize palette control (controlled prop + callback)"
type: bug
priority: high
flags: []
created: 2026-05-20
---

## Description

The library `Nav` owns its palette logic internally: an internal
`palette = $state(...)`, localStorage read/write under `dxlb-palette`, and
it sets `data-palette` on `<html>` directly. That works for a simple
consumer, but the website has a more capable palette system the Nav must
defer to:

- `src/hooks.server.ts` reads a `dxlb-palette` **cookie** server-side and
  sets `data-palette` on `<html>` during SSR — prevents a flash of the
  wrong theme on first paint.
- `src/lib/theme.svelte.ts` holds the palette rune and writes **both**
  localStorage and the cookie.
- The app's Nav toggle calls `togglePalette()`, feeding that system.

The library Nav's internal toggle:
- writes localStorage only (no cookie) → SSR no-flash breaks
- mutates its own `$state`, which desyncs from `theme.svelte` → the app's
  `getPalette()` goes stale and the root layout's `$effect` fights the
  toggle.

So the website currently can't adopt the library Nav without losing the
no-flash SSR. It keeps a custom `src/lib/ui/Nav.svelte` instead.

Reference:
- Library: `node_modules/@dxlbnl/ui/dist/components/navigation/Nav.svelte`
- App palette system: `src/lib/theme.svelte.ts`, `src/hooks.server.ts`,
  `src/routes/+layout.svelte`
- Custom Nav (to be retired once this lands): `src/lib/ui/Nav.svelte`

## Proposed fix — controlled / uncontrolled palette

Add a controlled mode. When the consumer passes `palette` +
`onPaletteToggle`, Nav renders the toggle but does NOT own the state:

```ts
interface Props {
  links?: NavLink[];
  siteName?: string;
  breadcrumbs?: BreadcrumbItem[];

  /** Controlled palette value. When provided, Nav does not manage its
   *  own palette state — the parent owns it. */
  palette?: 'phosphor' | 'paper';
  /** Called when the palette toggle is clicked. When provided, Nav does
   *  not write localStorage or data-palette itself. */
  onPaletteToggle?: () => void;

  // layout escape hatches — see below
}
```

Behaviour:

- **Controlled** (both `palette` and `onPaletteToggle` provided): the
  toggle glyph reflects `palette`; clicking calls `onPaletteToggle` and
  nothing else. The parent (the website's `theme.svelte`) does the
  localStorage + cookie + `data-palette` work.
- **Uncontrolled** (neither provided): keep today's internal behaviour so
  simple consumers still get a working toggle out of the box.

Website usage after the fix:

```svelte
<Nav
  links={…}
  breadcrumbs={…}
  palette={getPalette()}
  onPaletteToggle={togglePalette}
/>
```

## Also expose layout escape hatches

The library Nav is `position: fixed` with a `max-width: 1200px` inner.
The website Nav is in-flow (`position: relative`) and full-width. Going
fixed silently would hide content behind the bar on every page. Add:

- `sticky?: boolean` (default whatever the library prefers) — `false`
  renders the nav in-flow.
- `maxWidth?: string` (default `'1200px'`) — `'none'` for a full-width
  inner row matching the site's current Nav.

## Out of scope

- Breadcrumb auto-generation from the URL. The website computes crumbs in
  the layout and passes them as `breadcrumbs`; that's fine.

## Verification

After the fix, the website swaps `src/lib/ui/Nav.svelte` for
`<Nav palette={getPalette()} onPaletteToggle={togglePalette} sticky={false} maxWidth="none" … />`
in `(console)/+layout.svelte`. Toggling the palette must:
- update the glyph,
- persist via the app's cookie + localStorage,
- survive a hard refresh with no flash of the wrong theme (SSR reads the
  cookie).
