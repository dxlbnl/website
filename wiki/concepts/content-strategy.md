# Dexterlabs Content Strategy

This document outlines the content architecture for Dexterlabs, adhering to the locked "Console Protocol".

## The Three Pillars

The website content is divided into three distinct segments:

1.  **The Console (Index)**: The high-impact, minimalist command center.
2.  **The Repository (Logs/Blog)**: A structured, linked vault of system logs, project docs, and adventures.
3.  **The Catalogue (Products)**: Structured sales pages for the hardware cache.

## File Structure & Routing

-   `/content/repository/` -> Exposed via `/repository` route. Follows a blog format using Markdown.
-   `/content/products/` -> Exposed via `/catalogue` route. Follows a product display format for hardware. 

## Generative Art Strategy

Generative art is currently considered a "Phase 2" initiative for its own dedicated tier. However, early explorations, algorithmic visual systems, and P5.js sketches will be documented as narrative entries and stored within **The Repository**.

## Development Workflow

-   **Authoring**: All content is authored in pure Markdown. No Sveltia CMS is used.
-   **Tone**: Authentically coder-centric, documenting the raw process of bridging software and hardware ("Hacker HUD" aesthetic).
-   **Routing**: The SvelteKit frontend dynamically parses markdown files via `+page.server.ts` to surface the most recent logs and products.
