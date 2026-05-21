---
name: image-gen
description: Generate images via the Gemini MCP server (Imagen 4 family and Nano Banana family). Use this skill whenever the user wants to create, generate, design, or produce any image, illustration, icon, logo, hero, banner, mockup, diagram, screenshot stand-in, social card, poster, or other visual asset — even when they don't name a model and even when they phrase it casually ("I need an icon here", "make me a header image", "generate a thumbnail"). Use it for editing or iterating on previously generated images too. The skill picks the right model for the task, crafts a strong prompt, and saves the image into the project.
---

# image-gen

Generate images from inside Claude Code using the Gemini MCP server. This skill exists because picking the right model and writing a strong prompt are the two things that most determine output quality, and both benefit from codified conventions rather than ad-hoc decisions every time.

## When this skill applies

Any request that ends in a generated visual asset. Common phrasings:

- "Generate an icon for…"
- "I need a hero image for the landing page"
- "Make me a placeholder for the user avatar"
- "Create a diagram showing X"
- "Design a logo for…"
- "Give me a poster / banner / social card / thumbnail"
- "Generate three variations of…"
- "Edit this image to…" (when a previously generated image is in context)

If the user references an image they want and there's no upload, default to generating it.

## Prerequisites

The `gemini` MCP server must be installed and configured with `GEMINI_API_KEY`. If the tools aren't available, tell the user to install it:

```bash
claude mcp add gemini -s user -- env GEMINI_API_KEY=YOUR_KEY npx -y @rlabs-inc/gemini-mcp
```

…then restart Claude Code. Don't proceed with the skill until the MCP tools appear.

## The workflow

Every image-generation request goes through the same four steps. Don't skip steps; even fast requests benefit from the 10 seconds of thinking.

### Step 1 — Clarify intent (silently, in your head)

Before reaching for a tool, answer these questions from the conversation context. Don't ask the user unless something is genuinely ambiguous — guess and state your assumptions inline if needed.

- **What is the asset for?** (hero, icon, diagram, social, poster, mockup, decorative)
- **Where will it live?** (web header → 16:9, app icon → 1:1, mobile splash → 9:16, print poster → 3:4)
- **What's the aesthetic?** (photorealistic, illustrated, flat/geometric, 3D, sketch, retro)
- **Is there text in the image?** (changes model choice significantly)
- **Does it need to match existing assets?** (reference style/colors from earlier in the conversation)

### Step 2 — Pick the model

Use the table in `references/model-selection.md` for the full decision tree. Quick version:

| If the task is… | Use |
|---|---|
| Photorealistic, product shot, high realism | `imagen-4.0-ultra-generate-001` |
| Bulk drafts, social tiles, low cost | `imagen-4.0-fast-generate-001` |
| General quality images | `imagen-4.0-generate-001` |
| Has legible text in the image (poster, banner with copy, infographic) | Nano Banana 2 (`gemini-3.1-flash-image-preview`) |
| Editing or iterating with reference images | Nano Banana 2 |
| Complex reasoning-heavy prompts, diagrams, 4K | Nano Banana Pro (`gemini-3-pro-image-preview`) |
| User didn't specify and budget unclear | `imagen-4.0-generate-001` (sensible default) |

Read `references/model-selection.md` for the full decision tree and rationale when the task is non-obvious.

### Step 3 — Craft the prompt

This is where most quality comes from. Read `references/prompt-craft.md` for the full conventions; the short version:

Build prompts in this order: **subject → context → style → quality modifiers**.

> A *sketch* (style) of a *modern apartment building* (subject) surrounded by *skyscrapers* (context). Quality: detailed, professional.

For photorealism, include camera/lens cues from the photography table (e.g. "35mm portrait, golden hour, shallow depth of field"). For text-in-image, keep the text under 25 characters and specify font feel (e.g. "bold serif", "hand-drawn"). For illustrations, name the medium ("charcoal drawing", "art deco poster", "pastel painting"). For style consistency across multiple images in one session, lock a "style anchor" phrase and reuse it verbatim.

Always do a mental pass: would this prompt give a sharp, specific image, or a generic one? If generic, add details until specific.

### Step 4 — Generate and present

Call the MCP tool. Default to **1 image** unless the user asked for variations or batch — image generation is not free.

State briefly what you did (model + key choices), then show the result. If the file path is returned, surface it so they can open it. Don't post-mortem the prompt unless asked.

If the first result isn't right:
1. Diagnose **what specifically** is off (composition, lighting, subject, style)
2. Adjust **only the relevant part of the prompt**, not the whole thing
3. Use the same seed if you want to vary one dimension; new seed if you want a different draw

## Output handling

By default the MCP server writes images to the current working directory (or `GEMINI_OUTPUT_DIR` if set). For project-scoped work, suggest a path like `assets/generated/` or `public/images/` based on the project structure visible in context. If the project has a `.gitignore`, mention whether the generated dir is ignored.

Filename convention from the server is already sensible (`{model}_{timestamp}_{prompt-slug}.png`); don't try to rename unless asked.

## Cost awareness

Indicative pricing as of 2026:

- Imagen 4 Fast: ~$0.02/image
- Imagen 4: ~$0.04/image
- Imagen 4 Ultra: ~$0.06/image
- Nano Banana 2: cheaper Flash-tier pricing
- Nano Banana Pro: ~$0.13/image (most expensive, save for final renders)

For drafts and exploration, prefer Fast or Nano Banana 2. Reserve Ultra / Pro for the final pick.

## Common patterns

### Generating a set of UI assets

When the user wants multiple coordinated assets (e.g. "make me icons for these three features"), lock the style upfront in a single style anchor string and reuse it across each generation. Run them sequentially so you can adjust the anchor if the first feels off.

### Iterating on a single image

Use `seed` for reproducibility. Generate once, get a seed in the result, then re-prompt with the same seed plus the targeted edit. Switch to Nano Banana 2 for any edit that requires a reference to the previous output.

### Diagrams and architecture sketches

Use Nano Banana Pro — its reasoning improves spatial layout. Describe the structure ("three boxes labeled A, B, C connected by arrows showing data flow from A through B to C, isometric perspective, line-art style with subtle color fills").

### Working in a project context

If the user is working on a React/web project (look at recent file context), bias toward web-relevant aspect ratios (16:9 hero, 1:1 social, 9:16 mobile, 4:5 product card) and suggest saving to a path that matches the project's existing asset structure.

## Anti-patterns

- **Don't** generate before clarifying aspect ratio if it matters for the use case. A 1:1 logo and a 16:9 hero need different generations.
- **Don't** use Nano Banana Pro for casual exploration — it's the most expensive option.
- **Don't** stack ten quality modifiers ("4K HDR cinematic professional ultra-detailed masterpiece") — Imagen and Nano Banana respond better to specific descriptors than to a pile of buzzwords.
- **Don't** explain the prompt engineering after generation unless the user asks. Show the image and move on.
- **Don't** silently regenerate if the first image is "close" — ask whether to iterate or accept.

## Dexterlabs project context

When generating images for this project, always read `wiki/expertise/image-workflow.md` first. Key rules:

- **Published content images** (notes, products, mailings, projects) → save to `content/{type}/{slug}/`, then run `pnpm optimize`. Reference the `.webp` filename in frontmatter.
- **Dexterlabs cartoon style** → use the character sheet + environment compositor workflow documented in `wiki/expertise/artwork-prompts.md`. Character sheets live in `content/art/characters/`, environment plates in `content/art/environments/`. Use `gemini-3-pro-image-preview` (supports reference images).
- **Art library** (`content/art/`) → not optimized, not published directly. Working assets only.

## References

- `references/model-selection.md` — full decision tree for choosing models with examples
- `references/prompt-craft.md` — prompt construction conventions, photography cues, style references, text-in-image rules
- `wiki/expertise/image-workflow.md` — where to save images and how to run optimize
- `wiki/expertise/artwork-prompts.md` — Dexterlabs cartoon style, character sheets, environment plates, scene compositor workflow
