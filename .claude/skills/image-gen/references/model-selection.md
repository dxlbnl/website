# Model selection

The Gemini API exposes two parallel image-generation families. Both are current as of May 2026; neither replaces the other. Pick per task.

## The families

### Imagen 4 (Google DeepMind's dedicated image model line)

| Model ID | Strength | Use for |
|---|---|---|
| `imagen-4.0-generate-001` | Balanced quality, the default | General-purpose images, sensible default when unsure |
| `imagen-4.0-ultra-generate-001` | Highest photorealism, best prompt adherence | Final product shots, hero images, anything where photoreal quality matters. Generates one image at a time. |
| `imagen-4.0-fast-generate-001` | Speed, low cost | Drafts, bulk thumbnails, exploration |

Imagen 4 supports `1K` and `2K` output sizes (Standard and Ultra only), 1–4 images per call (Ultra is 1), and the aspect ratios `1:1`, `3:4`, `4:3`, `9:16`, `16:9`. Prompts are English only; max 480 tokens.

### Nano Banana family (Gemini-native multimodal image generation)

| Model ID | Strength | Use for |
|---|---|---|
| `gemini-2.5-flash-image-preview` (Nano Banana) | Fast, cheap, general use | Quick edits, bulk processing, drafts |
| `gemini-3-pro-image-preview` (Nano Banana Pro) | 4K, reasoning, complex prompts | Diagrams, infographics, dense-logic prompts, final renders at 4K |
| `gemini-3.1-flash-image-preview` (Nano Banana 2) | Flash speed with Pro-tier capability, up to 14 reference images, web grounding, 0.5K–4K | Text-in-image, editing with refs, anything modern multimodal |

Nano Banana models are conversational — you can edit the previous output by reference, and they handle structured data better. They also handle text rendering in images far better than Imagen.

## Decision tree

1. **Does the image need legible text inside it?** (poster headline, banner copy, infographic labels, UI mockup with copy)
   → **Nano Banana 2** (`gemini-3.1-flash-image-preview`)

2. **Is the user editing or iterating from a previously generated image?**
   → **Nano Banana 2** (handles reference images natively)

3. **Is it a diagram, flowchart, infographic, or anything with structural reasoning?**
   → **Nano Banana Pro** (`gemini-3-pro-image-preview`) — the reasoning helps with spatial layout

4. **Does it need to be photorealistic at high quality?** (product photo, portrait, real-world scene)
   → **Imagen 4 Ultra** (`imagen-4.0-ultra-generate-001`)

5. **Is it an exploration draft, bulk asset, or social tile where speed/cost matters?**
   → **Imagen 4 Fast** (`imagen-4.0-fast-generate-001`)

6. **None of the above; general illustration, icon, or stylized image?**
   → **Imagen 4** (`imagen-4.0-generate-001`) — the safe default

## Worked examples

**"Generate an app icon for a meditation app, minimal style"**
→ Imagen 4 (`imagen-4.0-generate-001`), aspect 1:1. Minimal style is illustration, no text in image, no need for photorealism or reasoning.

**"Hero image for a fintech landing page, photorealistic, two professionals at a desk"**
→ Imagen 4 Ultra, aspect 16:9, 2K. Photorealistic + final use case = Ultra.

**"Poster that says 'MONOREPO MAINTENANCE — TUESDAY 3PM' in bold sans-serif"**
→ Nano Banana 2. Legible in-image text is the trigger.

**"Architecture diagram showing the auth flow between client, gateway, and identity provider"**
→ Nano Banana Pro. Reasoning + spatial structure.

**"Generate 8 thumbnail variations of a coffee cup for A/B testing"**
→ Imagen 4 Fast or Nano Banana. Bulk + cheap matters more than peak quality.

**"Edit the previous image to remove the background and make it square"**
→ Nano Banana 2. Reference-image editing is its specialty.

**"Pixel art of a 16-bit dragon"**
→ Imagen 4 (`imagen-4.0-generate-001`). Stylized illustration, no special needs.

## When in doubt

Default to `imagen-4.0-generate-001`. It's not the cheapest or the most capable, but it gives reliable mid-range output for almost any general-purpose request, and it costs less than Ultra/Pro. If the user pushes back on quality, upgrade to Ultra. If they push back on cost, downgrade to Fast.

## Pricing snapshot (May 2026)

These move. Treat as approximate.

| Model | Approx cost per image |
|---|---|
| Imagen 4 Fast | $0.02 |
| Imagen 4 | $0.04 |
| Imagen 4 Ultra | $0.06 |
| Nano Banana | Flash tier (cheap) |
| Nano Banana 2 | Flash tier (~$0.50/M input, $3/M output tokens) |
| Nano Banana Pro | ~$0.13 (most expensive) |

For free-tier exploration, Fast and Nano Banana are the most forgiving on rate limits.
