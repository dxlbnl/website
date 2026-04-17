# Antigravity Wiki Schema & Workflow

This document defines how the Antigravity agent operates on the Dexterlabs repository and maintains this Wiki.

## Core Directives

1. **Svelte 5 Runes Mandatory**: Always use Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`, `onclick`). NEVER use legacy syntax.
2. **Minimalism (Lab Bench)**: Maintain a clean, high-contrast "Lab Bench" aesthetic. Avoid glitch effects, CRT scanlines, and heavy neon glows.
3. **Wiki-Driven Development**: Every significant change or entity must be documented in this Wiki.
4. **TypeScript Priority**: All new code must be strictly typed. Use `type` over `interface`.
5. **pnpm Workflow**: Use `pnpm` for all package management and script execution.

## Wiki Operations

### 1. Ingest
When a new source (article, image, data) is added:
- Read the source thoroughly.
- Create a summary page in `wiki/entities/` or `wiki/concepts/`.
- [Update the log](log.md) with a new entry.
- [Update the index](index.md) if new categories are created.
- Cross-link the new page to existing relevant pages.

### 2. Query
When answering questions:
- Always check the `wiki/` directory first for project context.
- Provide answers that can be filed back into the wiki if they represent a new synthesis.

### 3. Lint
Periodically check for:
- Dead links between wiki pages.
- Outdated tech specs (check `package.json` vs `wiki/design-system.md`).
- Missing entity pages for new project components.

## Writing Style: "The Lab Bench"

- **Benefits First**: Document *why* something exists before *how* it works.
- **Direct & Sparse**: Use short paragraphs, clear headers, and bullet points.
- **No Fluff**: Remove marketing-speak. Stick to technical credibility and user outcomes.
- **Tone**: Engineer-to-engineer. Honest, precise, and professional.

## Project Architecture

- **Web Framework**: SvelteKit 2.48.5 (Static Mode)
- **Styling**: Vanilla CSS with custom properties (Teal accent: `--accent-teal`).
- **Content**: MDX/Markdown via mdsvex.
- **Deployment**: Static build output to `build/`.
