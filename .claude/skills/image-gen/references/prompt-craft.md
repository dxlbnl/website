# Prompt craft

The single biggest lever for image quality is the prompt. These conventions come from Google's Imagen documentation and from what consistently works across the Imagen and Nano Banana families.

## The core formula

Every prompt has three required elements and one optional one:

> [**Subject**] in/on/with [**Context**], [**Style**]. [**Quality modifiers**].

- **Subject** — the object, person, animal, or scene. Be specific. "A coffee mug" → weak. "A matte black ceramic coffee mug, half-full, steam rising" → strong.
- **Context** — where the subject is, what surrounds it, lighting and time of day. "On a desk" → weak. "On a weathered oak desk beside an open notebook, morning light through a window" → strong.
- **Style** — medium and aesthetic. Photograph, sketch, oil painting, 3D render, flat illustration, pixel art, isometric, art deco poster, charcoal drawing, watercolor.
- **Quality modifiers** (optional) — used sparingly. "4K", "highly detailed", "professional photography", "studio lighting". One or two is enough; stacking ten is counterproductive.

### Example: weak → strong

**Weak:** "A robot holding a skateboard."

**Strong:** "A photo of a sleek white humanoid robot holding a bright red skateboard, standing on an empty city street at golden hour, soft warm lighting, shallow depth of field, 35mm lens, cinematic composition."

## Iteration mindset

Start with a short prompt and refine. Don't try to write the perfect prompt on the first attempt — write a clear starter and then add specificity for the parts that came out wrong.

```
v1: A park in the spring next to a lake
v2: A park in the spring next to a lake, the sun sets across the lake, golden hour
v3: A park in the spring next to a lake, the sun sets across the lake, golden hour, red wildflowers in the foreground
```

## Photography prompts

For photoreal output, start with **"A photo of…"** and add photographic descriptors. The combinations below are from Google's Imagen guide and work reliably.

### Photography modifier categories

| Category | Examples |
|---|---|
| Camera proximity | close-up, zoomed out, mid-shot |
| Camera position | aerial, from below, eye-level, over-the-shoulder |
| Lighting | natural light, dramatic lighting, golden hour, blue hour, studio lighting, warm/cold, backlit, rim lighting |
| Camera settings | motion blur, soft focus, bokeh, shallow depth of field, long exposure |
| Lens types | 35mm, 50mm, 85mm, macro, fisheye, wide-angle, telephoto |
| Film types | black and white, polaroid, film noir, vintage film, duotone |

### Photography lens cheat sheet (from Imagen docs)

| Use case | Lens | Focal | Extra modifiers |
|---|---|---|---|
| People (portraits) | Prime, zoom | 24–35mm | depth of field, duotone, black and white, film noir |
| Food, plants, insects (still life) | Macro | 60–105mm | high detail, precise focus, controlled lighting |
| Sports, wildlife (motion) | Telephoto zoom | 100–400mm | fast shutter speed, action tracking |
| Landscape, astro (wide) | Wide-angle | 10–24mm | long exposure, sharp focus, smooth water |

### Photography example combos

- *"A woman, 35mm portrait, blue and grey duotones"*
- *"A close-up photo of coffee beans on a wooden surface, natural lighting, macro lens 60mm"*
- *"Aerial photo of urban city with skyscrapers, golden hour"*
- *"Soft focus photograph of a bridge in an urban city at night, bokeh, 35mm"*

## Illustration and art prompts

Lead with **"A painting/sketch/drawing/illustration of…"** or specify the medium.

### Medium options

- Pencil drawing, technical pencil drawing, charcoal drawing
- Watercolor, pastel painting, oil painting, acrylic painting
- Digital art, 3D render, isometric 3D, low-poly
- Pixel art, voxel art
- Art deco poster, art nouveau, bauhaus, vaporwave, synthwave
- Comic book, manga, anime, ligne claire, retro 70s cartoon

### Historical art style

Use *"in the style of [movement]"*: impressionist painting, renaissance, pop art, art deco, ukiyo-e, art nouveau, cubist.

> A wind farm in the style of an impressionist painting.

### Shapes and materials

For surreal or branding-style work, use *"made of [material]"* or *"in the shape of [object]"*:

> An armchair made of paper, studio photo, origami style.

> Neon tubes in the shape of a bird.

## Text inside the image

Only Nano Banana 2 / Pro handle this reliably. Even so, follow these rules from the Imagen docs (they apply broadly):

- **Keep text under 25 characters** for best results.
- **Use 2–3 short phrases max**, not paragraphs.
- **Specify font feel**, not a specific font name: "bold sans-serif", "elegant serif", "hand-drawn brush script", "retro 80s display type".
- **Specify size and placement loosely**: "large title at top", "small caption at bottom right".
- **Expect to regenerate** — text rendering is the least deterministic part of image gen.

### Text-in-image example

> A poster with the text "Summerland" in bold serif as a large title at the top, underneath the slogan "Summer never felt so good" in smaller hand-drawn script. Background: pastel sunset gradient, palm tree silhouettes.

## Quality modifiers (use sparingly)

| Type | Words |
|---|---|
| General | high-quality, beautiful, stylized, detailed |
| Photos | 4K, HDR, studio photo, taken by a professional photographer |
| Art | by a master illustrator, professional, detailed lineart |

Use **one or two** quality modifiers, not a pile. "4K HDR cinematic ultra-detailed masterpiece award-winning trending on artstation" actively makes outputs worse — the model can't honor that many contradictory pulls.

## Aspect ratio guidance

Aspect ratio is a parameter, not part of the prompt — but think about it before generating.

| Ratio | Best for |
|---|---|
| 1:1 | Logos, app icons, avatars, Instagram posts |
| 4:3 | Photography, presentations, medium-format feel |
| 3:4 | Portrait shots, posters, mobile-vertical-but-not-fullscreen |
| 16:9 | Web heroes, landing page banners, video thumbnails, monitor wallpapers |
| 9:16 | Mobile screens, stories, vertical video, tall buildings/waterfalls |

## Style anchors for consistency

When generating multiple coordinated images in one session, write a "style anchor" once and append it verbatim to each prompt. Example:

> **Anchor:** *Flat illustration, muted earth tones (sage, terracotta, cream), simple geometric shapes, no text, subtle paper texture.*
>
> Generation 1: A coffee cup. [+anchor]
> Generation 2: A laptop. [+anchor]
> Generation 3: A book. [+anchor]

This is the single most reliable way to keep a multi-image set visually coherent.

## Negative prompts

Some models support negative prompts (what to avoid). Use these sparingly and for specific exclusions:

- "no text" — when the model keeps adding random letters
- "no people" — when generating a scene
- "no watermark" — though models shouldn't add these anyway
- "uncluttered" — to fight busy compositions

Don't use negative prompts as a dumping ground ("blurry, bad anatomy, deformed, ugly") — modern models don't need this and it sometimes biases the output oddly.

## Reproducibility

When you want to iterate on a specific result, use the `seed` parameter. Same seed + same prompt = same image. Same seed + slightly different prompt = a variant that shares composition. Different seed = a completely different draw.

This is the right tool for "make the same image but with X changed" requests.

## Quick reference: prompt anti-patterns

| Don't | Do |
|---|---|
| "A nice picture of a forest" | "A photo of a misty pine forest at dawn, low fog, soft directional light, 35mm" |
| Stack 10 quality modifiers | Pick 1–2 specific ones |
| "Beautiful, stunning, masterpiece, ultra-realistic, 8K, trending" | "Photoreal, 35mm, studio lighting" |
| Tell the model what NOT to do (when you can tell it what TO do) | Describe the actual desired result |
| Reuse a long prompt verbatim when only one detail should change | Edit just the relevant clause; keep the rest stable |
