# Artwork Generation: Dexter's Laboratory Character Illustrations

Use this guide when generating header or feature illustrations for notes, projects, or any page in the Dexterlabs ecosystem where a fun, recognisable character image fits.

## The style

**Dexter's Laboratory** cartoon aesthetic. Key visual properties:

- **Thick bold outlines** — every shape has a clean, heavy black border
- **Flat cel-shaded colors** — solid fills, no gradients, minimal shadow
- **Simplified shapes** — hair is a single shape, faces are geometric, hands are blobs
- **Exaggerated proportions** — big heads, small bodies, short limbs
- **Limited palette** — 4–6 colours per character; backgrounds use a blue/teal base with warm accent panels
- **Lab background** — teal/blue panelled walls, circular tech elements, glowing screens, grid-tiled floor

Reference style images live at:
```
static/Logo-research/dexterslaboratory-ref1.jpg
static/Logo-research/dexterslaboratory-ref2.png
static/Logo-research/dexterslaboratory-ref3.jpg
static/Logo-research/dexterslaboratory-ref4.jpg
```

## Character likeness (Dexter — the real one)

Source photos live at:
```
static/Logo-research/dexter-source1.png   ← sunglasses, outdoors
static/Logo-research/dexter-source2.png   ← glasses, outdoors
```

**Translating real features into cartoon:**

| Real feature | Cartoon adaptation |
|---|---|
| Curly ginger/red hair | Stylised orange puff or tight-curl shape, same colour |
| Ginger beard | Retained as a simple orange shape on the jaw |
| Glasses (round/rectangular) | Thick-framed blue goggles/lenses — matches the show's style |
| Wide friendly smile | Exaggerated open grin, show-style |
| Stocky adult build | Heavier proportions than the child Dexter — this is an adult scientist |
| White lab coat | White lab coat, same as the show character |

The character should read as the show's Dexter grown up and filled out — not a child, not a generic cartoon scientist.

## Tooling note

The `@rlabs-inc/gemini-mcp` server (used in Claude Code) does **not** support reference image inputs — its generation and edit tools are text-prompt-only. For persona generation and any prompt that requires style or likeness references, use **Google AI Studio** ([aistudio.google.com](https://aistudio.google.com)) directly:

1. Open a Gemini 2.0 Flash or 2.5 Pro session with image generation enabled
2. Attach all 6 reference images (drag-and-drop into the prompt)
3. Paste the prompt text from this page

Once you have canonical persona images generated (standing poses, expression variants), save them alongside the source refs. Those persona outputs can then be used as references in subsequent Claude Code / MCP edit sessions.

## Writing the prompt

Always attach **all six reference images** (4 style refs + 2 likeness sources) when prompting Gemini. Then:

1. **Describe the style briefly** — "Dexter's Laboratory cartoon style, thick outlines, flat cel-shading — match the attached style references"
2. **Describe the character** — list the key features above; instruct Gemini to adapt them using the likeness photos
3. **Describe the scene specifically** — what is Dexter doing, what's in the background, what props are present
4. **Specify the format** — `16:9 landscape` for note/article headers

### Template

```
Using the attached reference images:
- dexterslaboratory-ref1–4: visual style — thick bold outlines, flat cel-shading, Dexter's Laboratory cartoon aesthetic
- dexter-source1–2: character likeness — curly ginger hair, ginger beard, wide smile

Draw a Dexter's Laboratory style cartoon illustration of the person from the likeness photos. Adapt his real features into the show's visual language: curly orange-red hair as a stylised puff, ginger beard as a simple jaw shape, thick-framed blue-lensed glasses (lab goggles style), white lab coat. He's the grown-up version of the child Dexter — same lean cartoon build.

Scene: [describe what Dexter is doing and what's in frame]

Background: Dexter's Laboratory lab setting — teal/blue panelled walls, circular tech elements, glowing screens.

Style: flat colours, thick outlines, cel-shaded, no gradients, bold and graphic. 16:9 landscape.
```

---

## Worked examples

### Note 008 — Vibin multi-agent workflow

**The joke:** the manager's actual job is to sit in a big chair and do nothing while robots lose their minds around him. The chaos is the workflow.

**Scene:** Dexter is reclining in a massive command throne, feet up on the console, arms folded smugly, coffee mug in hand that reads "ORCHESTRATING". All around him, four tiny blocky robots are in full panic mode:
- **"SPEC"** robot: hunched over a tiny typewriter, sweating profusely
- **"TEST"** robot: surrounded by a towering stack of red-marked failing papers, crying a single cartoon tear
- **"IMPL"** robot: frantically running in circles with its arms full of tangled cables
- **"REVIEW"** robot: holding an enormous rubber stamp that reads "REJECTED", gleefully stamping everything in sight — including the IMPL robot's head

To the left, a bouncer robot the size of a fridge blocks a door, holding a sign: **"READ THE WIKI FIRST"**. A queue of tiny identical robots waits in line. One at the front is reading a giant glowing book labelled **WIKI** with exaggerated reverence, one tiny finger tracing the words.

On the main screen above Dexter: a kanban board. Three columns are crammed with cards. The DONE column has exactly one card. Dexter is pointing at it with a smug grin.

---

### Variant B — The rejection loop

**The joke:** the reviewer's job is to reject things. It has never not rejected something.

**Scene:** A cartoon conveyor belt runs through the lab. The IMPL robot places a neatly wrapped package on it and looks expectantly. It reaches the REVIEW robot at the other end. The REVIEW robot immediately, mechanically, joyfully stamps it "REJECTED" without even opening it and shoves it back onto the return belt. The package travels back to IMPL. This has clearly happened many times — there's a towering pile of identical rejected packages beside IMPL, who is holding its head in its hands. In the background, Dexter watches from a viewing window above, eating popcorn, completely unbothered.

```
Scene: a conveyor belt runs through the lab. An IMPL robot places a neat package on it. At the
other end, a REVIEW robot immediately stamps it "REJECTED" without opening it — gleeful,
mechanical, inevitable — and shoves it back. The package returns to IMPL, who stands next to a
towering pile of identical rejected packages. IMPL is holding its head in its hands.

In the background behind a large glass observation window, Dexter watches eating popcorn.
His expression: serene. This is going exactly as planned.

Same character and style rules as above. 16:9 landscape.
```

---

### Variant C — Test-first horror

**The joke:** hand the implementer a failing test before any code exists. Watch the gears stop turning.

**Scene:** Dexter, holding a clipboard, cheerfully hands a single sheet of paper to the IMPL robot. The paper reads at the top: **"FAILING TEST"** — below it, a dense wall of red error text. The IMPL robot has frozen. Smoke is coming out of its head. Its eyes have turned into spinning question marks. Behind it, a blank code editor screen. Dexter's expression: helpful, expectant, completely missing the problem.

```
Scene: Dexter cheerfully hands a sheet of paper to an IMPL robot. The paper is labelled
"FAILING TEST" with a dense block of red error text beneath. The IMPL robot has completely
frozen — smoke rising from its head, eyes replaced with spinning question marks. Behind it,
a blank code editor screen.

Dexter looks on with a helpful, expectant expression. He sees no issue.

Same character and style rules as above. 16:9 landscape.
```

---

### Variant D — The spec was wrong

**The joke:** everyone finished. The wiki was wrong. It's fine.

**Scene:** All four robots (SPEC, TEST, IMPL, REVIEW) are standing in a row, exhausted, covered in oil stains and cartoon sweat. They're holding a giant "DONE ✓" banner between them. In front of them, a large screen shows the final output. It is completely wrong — backwards, upside down, or nonsensical. Dexter looks at it, looks at the wiki, looks back at it. He pulls out a pencil and updates one line in the wiki. He gives a thumbs up. The robots all slump.

```
Scene: four robots (labelled SPEC, TEST, IMPL, REVIEW) stand in a row holding a "DONE ✓"
banner. They are exhausted — oil stains, drooping eyes, cartoon sweat droplets. Behind them,
the project output is displayed on a big screen. It is clearly, visibly wrong.

Dexter looks at the screen. Looks at his wiki. Looks back at the screen. Pulls out a pencil.
Updates one line in the wiki. Gives an enthusiastic thumbs up to camera.

The robots all slump simultaneously.

Same character and style rules as above. 16:9 landscape.
```

---

### Note 008 main prompt (the full chaos scene)

**Full prompt:**

```
Using the attached reference images:
- dexterslaboratory-ref1–4: visual style reference — thick bold outlines, flat cel-shaded colours, Dexter's Laboratory cartoon aesthetic
- dexter-source1–2: likeness reference — curly ginger hair, ginger beard, wide smile

Draw a Dexter's Laboratory style cartoon illustration of the person from the likeness photos.
Adapt his features: curly orange-red hair as a stylised puff, ginger beard as a simple jaw shape,
thick-framed blue lab-goggle lenses, white lab coat. Adult proportions — grown-up version of the
child Dexter in the reference images, same lean cartoon build.

Scene: Dexter is reclining in an oversized command throne, feet up on the console, arms folded
smugly, holding a coffee mug labelled "ORCHESTRATING". He looks entirely too pleased with himself.

Around him, chaos:
- A "SPEC" robot hunches over a tiny typewriter, visibly sweating
- A "TEST" robot stands in a mountain of red-stamped failing papers, single cartoon tear on its cheek
- An "IMPL" robot sprints in circles with arms full of tangled cables
- A "REVIEW" robot gleefully wields an enormous rubber stamp reading "REJECTED" — mid-stamp on
  the IMPL robot's head

To the left, a fridge-sized bouncer robot blocks a door labelled "LAB". It holds a sign:
"READ THE WIKI FIRST". A queue of tiny identical robots waits outside. The one at the front reads
a giant glowing tome labelled "WIKI" with one finger tracing the words, completely reverent.

On the main screen above Dexter: a kanban board. INBOX, READY, DOING columns are packed with
cards. The DONE column has exactly one card. Dexter is pointing at it.

Background: Dexter's Laboratory lab — teal/blue panelled walls, circular tech elements, grid floor.
Style: flat colours, thick outlines, cel-shaded, no gradients, bold and graphic. 16:9 landscape.
```
