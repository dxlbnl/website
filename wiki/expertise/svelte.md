# Svelte 5 patterns

Reference for Svelte 5 component authoring. Read this instead of `node_modules/`.
Official docs at `svelte.dev`.

This project uses **Svelte 5 runes throughout** — no legacy reactivity (`export let`, `$:`, `onMount`, slots, event directives). Do not mix the two styles in the same component.

---

## Component structure

```svelte
<script lang="ts">
  // imports, props, state, logic
</script>

<!-- markup -->

<style>
  /* scoped CSS */
</style>
```

All three blocks are optional. Order is conventional — script → markup → style.

---

## Props

```svelte
<script lang="ts">
  // Simple props with types inline
  let { title, count = 0 }: { title: string; count?: number } = $props()

  // With an interface (preferred for larger prop sets)
  interface Props {
    label: string
    disabled?: boolean
    variant?: 'primary' | 'ghost'
    onclick?: (e: MouseEvent) => void
  }
  let { label, disabled = false, variant = 'primary', onclick }: Props = $props()
</script>
```

`$props()` replaces `export let`. Destructure defaults inline. TypeScript types go in the destructuring annotation, not on the variable.

### Rest props (spread to root element)

```svelte
<script lang="ts">
  let { label, ...rest }: { label: string; [key: string]: unknown } = $props()
</script>

<button {...rest}>{label}</button>
```

### Bindable props (two-way binding)

```svelte
<!-- Child -->
<script lang="ts">
  let { value = $bindable('') }: { value?: string } = $props()
</script>
<input bind:value />

<!-- Parent -->
<Child bind:value={myVar} />
```

`$bindable(defaultValue)` marks a prop as two-way bindable. Only use it when the component genuinely owns writable state that parents need to read.

### `children` snippet prop

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte'
  let { children }: { children: Snippet } = $props()
</script>

<div>{@render children()}</div>
```

`children` is the conventional name for the default content slot. It is a `Snippet` type from `'svelte'`.

---

## State

```svelte
<script lang="ts">
  let count = $state(0)
  let items = $state<string[]>([])
  let obj = $state({ x: 0, y: 0 })
</script>

<button onclick={() => count++}>{count}</button>
```

`$state` is deeply reactive — mutating nested objects/arrays triggers updates:

```ts
items.push('new item')   // reactive ✓
obj.x = 10               // reactive ✓
```

### `$state.snapshot` — get a plain copy

```ts
const snapshot = $state.snapshot(items)  // non-reactive plain array/object
```

### `$state.raw` — opt out of deep reactivity

```ts
let data = $state.raw(largeObject)  // only reassignment triggers updates, not mutations
```

---

## Derived state

```svelte
<script lang="ts">
  let count = $state(0)

  // Simple expression
  const doubled = $derived(count * 2)

  // Multi-step logic
  const result = $derived.by(() => {
    if (count < 0) return 'negative'
    return count * 2
  })
</script>
```

`$derived` is lazy and memoised — only recomputes when its dependencies change. Never assign to a derived value.

---

## Effects

```svelte
<script lang="ts">
  let query = $state('')

  // Runs after every render where query changed
  $effect(() => {
    console.log('query is now', query)
    return () => {
      // cleanup runs before the next run or on destroy
      console.log('cleanup')
    }
  })

  // Runs only once on mount (no reactive dependencies tracked)
  $effect(() => {
    const handler = () => { /* ... */ }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  })
</script>
```

`$effect` runs after the DOM updates. Do not read and write the same reactive state inside one effect — it will loop. For DOM manipulation, `$effect` replaces `onMount` + `onDestroy`.

### `$effect.pre` — runs before DOM update

```ts
$effect.pre(() => {
  // runs synchronously before the DOM is patched
})
```

---

## Inspecting state (dev only)

```ts
$inspect(count)             // logs count whenever it changes
$inspect(count).with(console.trace)  // custom inspector
```

Strips out in production builds.

---

## Template syntax

### Conditionals

```svelte
{#if condition}
  <p>True</p>
{:else if other}
  <p>Other</p>
{:else}
  <p>False</p>
{/if}
```

### Loops

```svelte
{#each items as item (item.id)}
  <li>{item.name}</li>
{:else}
  <p>No items</p>
{/each}
```

The `(item.id)` keyed expression is optional but important for lists that change — it tells Svelte which DOM node corresponds to which item.

### Await

```svelte
{#await promise}
  <p>Loading…</p>
{:then value}
  <p>{value}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
```

### HTML injection (trusted content only)

```svelte
{@html trustedMarkupString}
```

Never use with user-supplied content — no sanitisation is applied.

### Render tag

```svelte
{@render children()}
{@render header?.()}    <!-- optional snippet -->
```

---

## Snippets

Snippets replace slots. They are defined with `{#snippet name(...args)}` and called with `{@render name(...args)}`.

### Inline snippets

```svelte
{#snippet row(item: { id: number; label: string })}
  <div class="row">
    <span>{item.id}</span>
    <span>{item.label}</span>
  </div>
{/snippet}

{#each items as item}
  {@render row(item)}
{/each}
```

### Snippets as props (passing to child components)

```svelte
<!-- Parent -->
{#snippet eyebrow()}
  <Inline gap="xs">
    <Led color="amber" />
    <Text variant="eyebrow">LIVE</Text>
  </Inline>
{/snippet}

<PageHero {eyebrow} heading="Dashboard." />

<!-- Child (PageHero) -->
<script lang="ts">
  import type { Snippet } from 'svelte'
  let { eyebrow, heading }: { eyebrow?: Snippet; heading: string } = $props()
</script>

{@render eyebrow?.()}
<h1>{heading}</h1>
```

### Typed snippet props

```ts
import type { Snippet } from 'svelte'

interface Props {
  children: Snippet
  header?: Snippet<[title: string]>  // snippet that receives a string argument
}
```

---

## Events

Svelte 5 uses standard DOM event attributes — no `on:` directive.

```svelte
<button onclick={handleClick}>Click</button>
<input oninput={(e) => (value = e.currentTarget.value)} />
<form onsubmit={(e) => { e.preventDefault(); submit() }}>
```

For custom component events, use callback props:

```svelte
<!-- Child -->
<script lang="ts">
  let { onselect }: { onselect?: (id: number) => void } = $props()
</script>
<button onclick={() => onselect?.(42)}>Select</button>

<!-- Parent -->
<Child onselect={(id) => console.log(id)} />
```

No `createEventDispatcher`, no `dispatch()` — just call the prop.

---

## Bindings

```svelte
<input bind:value={text} />               <!-- string -->
<input type="number" bind:value={num} />  <!-- coerced to number -->
<input type="checkbox" bind:checked={on} />
<select bind:value={selected}>
  {#each options as o}<option value={o}>{o}</option>{/each}
</select>
<textarea bind:value={text} />

<!-- Element reference -->
<canvas bind:this={canvasEl}></canvas>
```

`bind:value` on `<input type="number">` automatically coerces to a number.

---

## Lifecycle (without runes for context)

In Svelte 5, `$effect` handles most lifecycle needs. The legacy functions still work if needed:

```ts
import { onMount, onDestroy, tick } from 'svelte'

onMount(() => { /* runs once after mount */ })
onDestroy(() => { /* runs on destroy */ })
await tick()  // wait for pending DOM updates to flush
```

Prefer `$effect` with a cleanup return over `onMount`/`onDestroy` pairs.

---

## Context API

Share data down the component tree without prop drilling.

```ts
import { setContext, getContext } from 'svelte'

// In a parent component
setContext('theme', { color: 'amber' })

// In any descendant
const theme = getContext<{ color: string }>('theme')
```

Context is synchronous and set during component initialisation. It does not cross the server/client boundary.

---

## Scoped CSS

Styles in `<style>` are scoped to the component by default — Svelte adds a hash class.

```svelte
<style>
  .entry { padding: 12px 0; }           /* scoped — only applies inside this component */
  :global(.prose p) { margin: 0; }      /* unscoped — applies everywhere */
  .parent :global(.child) { color: red; }  /* scoped parent, unscoped child */
</style>
```

To style child components from a parent, use `:global()` or pass a `class` prop to the child.

CSS variables defined in `app.css` (`var(--amber)`, `var(--mono)`, etc.) are always available inside scoped style blocks.

---

## TypeScript in components

```svelte
<script lang="ts">
  // Generic components
  interface Props<T> {
    items: T[]
    render: (item: T) => string
  }
  let { items, render }: Props<string> = $props()

  // Asserting event target type
  function handleInput(e: Event) {
    const value = (e.currentTarget as HTMLInputElement).value
  }
</script>
```

Use `lang="ts"` on every `<script>` block. The project runs `svelte-check` in strict mode — all props must be typed.

---

## Common patterns in this codebase

### Page with server data

```svelte
<script lang="ts">
  import type { PageData } from './$types'
  let { data }: { data: PageData } = $props()
</script>
```

### Conditional rendering of empty state

```svelte
{#each data.items as item (item.id)}
  <div class="entry">...</div>
{:else}
  <p class="empty">// NO RECORDS FOUND</p>
{/each}
```

### Derived filter from state

```svelte
<script lang="ts">
  let filter = $state('all')
  const visible = $derived(
    filter === 'all' ? data.items : data.items.filter(i => i.status === filter)
  )
</script>
```
