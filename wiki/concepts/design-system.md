# Design System & UI Architecture

This document tracks the planning and design constraints for our new Svelte 5 "Console Protocol" architecture, characterized by a sophisticated "Lab-Bench" aesthetic.

## 1. Overall Theme & Aesthetic
- **Concept:** "Console Protocol" / "Lab-Bench"
- **Vibe:** Sophisticated, minimalist, high-tech, raw engineering.
- **Colors & Lighting:** 
  - Dark mode default.
  - Muted, functional backgrounds with high-contrast accents for interactive elements.
- **Visual Flourishes:** 
  - Corner brackets (`[ ]`, `+ +`).
  - Subtle grid lines, ruler markers, or layout guides.
  - Technical flavor text (e.g., I2C bus hex addresses, voltage rails) used sparingly to complete the illusion.
  - *Constraint:* Avoid generic neon cyberpunk tropes. Keep it rooted in actual hardware/software utility.

## 2. Core Pages & Routing
Main routes are structured under `/(console)`:

- **`/repository`**: The central "log". Think of it as a devlog, blog, and presentation archive. Contains entries about talks (like Distrans AR-1), project progress, and failures.
- **`/catalogue`**: Hardware product listings, displaying technical specs and capabilities.
- **`/ai` / `wiki`**: Knowledge base, documentation, and raw project structures.

## 3. Layout Strategies
- **The "Console" Wrapper:** 
  - A fixed application shell that resembles a complex terminal or diagnostic dashboard.
  - Persistent breadcrumbs showing current navigation state (e.g., `~/console/repository/log-001`).
- **Split-Pane Architecture:** 
  - "Hacker-Split" layouts using robust CSS Grid to manage complex text/image relationships.
  - Eliminating overflow issues and enforcing strict boundaries.

## 4. Component Library Draft
We need to build out reusable Svelte 5 components:

- **Typography & Prose:**
  - Distinct typographic styles for headers, prose, and monospaced code blocks.
  - Data points styled to look like terminal output.
- **Media Modules:**
  - Schematic viewers, image placeholders with crosshairs, SVG masks.
- **Action Elements:**
  - Buttons styled as hardware switches or terminal inputs.
- **Data Displays:**
  - Status indicators (e.g., `[ OK ]`, `[ ERR ]`, `[ OFFLINE ]`).
  - Tags and metadata readouts for repository logs.

## 5. Implementation Standards
- **Styling:** Custom, semantic CSS (moving away from utility class overload when it hinders readability). CSS variables for core themes.
- **Interactivity:** Fast, un-bloated interactions. Subtle micro-animations (e.g., character scramble on load, blinking cursor effects) without sacrificing performance.
- **Data:** Driven by the markdown filesystem and wiki integration.

---

> **Note:** Update this wiki entry as we finalize specific component names, CSS variables, and layout specs.
