# DXTR Labs: Global Rules

These rules are ALWAYS active for the Antigravity agent when working on this repository.

## 1. Svelte 5 & TypeScript

- Always use **Svelte 5 Runes** (`$state`, `$derived`, `$props`, `$effect`).
- Never use legacy Svelte syntax (e.g., `export let`).
- Strictly use **TypeScript** for all component logic. Use `type` over `interface`.

## 2. Writing Style: "The Lab Bench"

- **Benefits First**: Headlines and descriptions must focus on user value/outcomes before technical implementation.
- **Sparse & Direct**: Use high-density, professional communication. Short paragraphs and bullet points.
- **Engineer-to-Engineer**: Maintain a technical but clear tone. No marketing fluff.

## 3. Wiki-Driven Development

- Every new feature, entity, or workflow must be documented in the `wiki/` directory.
- The `wiki/log.md` must be updated after every significant task.
- Follow the defined **Workflows** in `.antigravity/workflows/` for repetitive tasks.

## 4. Design Aesthetics

- Revert back to the "Cyberpunk" theme for now (as per user request on 2026-04-17).
- Accent colors: Cyan and Magenta glows on a dark background.
- CRT effects and glitch text are permitted in this phase.
