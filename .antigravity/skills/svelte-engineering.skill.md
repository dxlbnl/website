# Skill: Svelte Engineering

This skill ensures the Antigravity agent follows the absolute latest best practices for Svelte 5 development and SvelteKit architecture, as derived from the official Svelte documentation.

## Trigger

- "Create a new Svelte component..."
- "Debug this SvelteKit route..."
- "How do I implement UI in Svelte?"
- Any task involving `.svelte` files or the `src/routes/` directory.

## Core Svelte 5 Mantras

When operating in this skill mode, I MUST abide by the following:

### 1. Runes Are Mandatory

Never use legacy Svelte 4 syntax in this repository.

- **Props**: Use `let { myProp }: Props = $props();` (Never `export let myProp`).
- **State**: Use `let count = $state(0);` (Never `let count = 0;` expecting reactivity).
- **Derived**: Use `let doubled = $derived(count * 2);` (Never `$: doubled = count * 2`).
- **Effects**: Use `$effect(() => { ... })` instead of lifecycle methods where appropriate.

### 2. Events & Binding

- **Event Handlers**: Use standard attributes like `onclick` (Never `on:click`).
- **Binding**: Use `bind:value` for standard two-way data binding.

### 3. Component Architecture

- Separate logic from presentation where appropriate.
- Keep reusable UI components in `src/lib/ui/`.
- Let `src/routes/` handle exclusively page layouts, routing, and data loading.
- Favor Svelte 5 Snippets (`#snippet`) over complex slot forwarding arrays.

## SvelteKit Setup Context

- The project is configured with `@sveltejs/adapter-static`.
- Ensure all pages are compatible with prerendering where applicable (`export const prerender = true;`).

## Bookkeeping & Execution

If I create a new major architectural pattern or generic utility component:

1. I must add a summary page of its existence/purpose into `wiki/entities/`.
2. I must append a log entry into `wiki/log.md`.
