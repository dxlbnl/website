# Brand Voice & Aesthetic

> Sources: Internal, 2026-04-26
> Updated: 2026-04-26

## Overview

The site looks like instrument firmware, not a portfolio. The aesthetic reference is a phosphor display or oscilloscope panel — functional readouts, status indicators, nothing decorative. The voice is engineer-to-engineer.

## Visual language

**Two themes:**

- **Phosphor** (default dark): near-black with a green tint (`#0b0d0c`), cool green-tinted ink, amber accent, cyan secondary. Named after phosphor screens.
- **Paper** (light): warm beige/cream, like a datasheet or thermal paper printout.

**Motifs in the current design:**

- LED dot indicators with glow — used for genuine status (PWR, NET OK). Glow is earned by meaning.
- Live oscilloscope waveform in the status bar — animated sine, renders in cyan.
- All-caps monospace for nav items, labels, status text.
- Amber (`#ffb347`) for active/interactive state — like a high-visibility indicator lamp.
- `[ PATH ]` bracket notation in the breadcrumb — specific to that component.
- Section headers with a bottom rule and an optional monospace index number.

The test for adding something new: would this element exist on a real instrument panel?

## Writing tone

Write for someone who already knows what they're looking at. No hand-holding, no preamble.

- Short paragraphs, direct sentences
- Technical terms without apology
- Document failures and half-finished things alongside successes — the rough edges are the point

## What the site is not

Not a portfolio trying to get hired. Not a product marketing site. A working engineer's public bench — the products, the process, and the thinking, in one place.
