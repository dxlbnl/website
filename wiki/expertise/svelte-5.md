# Expertise: Svelte 5

This wiki entry encapsulates the expertise integrated into the Antigravity agent for building front-end applications with Svelte 5. The knowledge is derived directly from `https://svelte.dev/llms-full.txt`.

## Core Philosophy
Svelte 5 shifts from compiler-based pseudo-reactivity (`$:`) to deep, signal-based reactivity known as **Runes**. It removes the ambiguity of let variables and replaces them with explicit state markers.

## Key Runes
- `$state`: Declares reactive state.
- `$derived`: Computes values based on `$state` dependencies automatically.
- `$props`: Retrieves component props in a typed manner.
- `$effect`: Executes side-effects after the DOM updates when dependencies change.

## Syntax Modernization
- **Events**: Legacy `on:event` directives are replaced by standard HTML attributes like `onclick` and `onkeydown`, aligning Svelte closely with standard vanilla JS semantics.
- **Snippets**: Reusable template sections are now built with `{#snippet name(args)}...{/snippet}` instead of generic slots, making component composition vastly more readable.

## Context
Dexterlabs utilizes Svelte 5 alongside SvelteKit configured with `@sveltejs/adapter-static` to generate hyper-fast, pre-rendered static sites suitable for minimal "Lab Bench" aesthetics.
