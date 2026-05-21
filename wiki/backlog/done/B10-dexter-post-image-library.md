---
id: B10
title: Dexter post-image library
type: research
priority: high
flags: []
created: 2026-05-21
report: wiki/research/post-image-library.md
---

## Description

Build a reusable post-image library in three phases, treating character and environment as separate concerns — the way animation studios do it.

**Phase 1 — Character sheet (5–6 images)**
Generate a set of character-only images with identical likeness across all: same orange curly hair, ginger beard, blue lab-goggle glasses, white lab coat, adult proportions. Simple or neutral background. Poses needed: neutral standing, typing/focused, holding component up to inspect, arms-up eureka, explaining/gesturing to camera, grimacing at something off-screen. These images become the canonical likeness references for all future generation — passed as reference to Nano Banana 2 when generating scenes.

**Phase 2 — Environment plates (5–6 images)**
Backgrounds only — no character present. Lab-bench aesthetic in Dexter's Laboratory cel-shaded style. Environments: eurorack wall (dense patch cables, modules), soldering/PCB bench (iron, magnifier, green PCB), 3D printer station (printer mid-print, filament spools), coding setup (dark room, multiple monitors with terminals), oscilloscope bench (scope + probes + device under test), and one generic lab interior (teal walls, glowing screens, grid floor — the show's canonical background).

**Phase 3 — Scene generation (8–10 post images)**
Composite character + environment: pass a character sheet image AND the relevant environment plate as dual references to Nano Banana 2, then describe the action. Output 16:9 at `static/images/post-library/dxl-{slug}.jpg`.

Research questions:
1. Does Nano Banana 2 (`mcp__gemini-local__edit_image`) hold character likeness when passed a character-sheet reference + an environment plate reference simultaneously?
2. Should character sheets be generated with `imagen-4.0-generate-001` first (best text-prompt quality), then used as reference for Nano Banana 2 scene edits?
3. What naming and folder convention for the three asset tiers (`characters/`, `environments/`, `post-library/`)?

Output: `wiki/research/post-image-library.md` — the three-phase plan, per-phase asset list, generation workflow decision, per-scene prompts. Actual generation follows as a chore.

## Notes

- Reference images: `static/Logo-research/dexter-source1.png`, `dexter-source2.png` (likeness), `dexterslaboratory-ref1–4` (style)
- Avatar variants: `static/Logo-research/dexter_avatar_v7_1_1777374887675.png` is the strongest single character portrait to date
- Existing canonical scenes: note 006 (dark server/wiring), note 008 (vibin chaos)
- Artwork prompting guide: `wiki/expertise/artwork-prompts.md`
- Image-gen skill: `.claude/skills/image-gen/SKILL.md`
