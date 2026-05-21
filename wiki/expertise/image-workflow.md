# Image generation workflow

**Applies to published content only** — notes, products, mailings, projects. Not applicable to `content/art/` (working/reference assets) or anything not destined for the site.

All source images for published content live in `content/`. The `pnpm optimize` script converts and copies them into `static/images/` as both `.webp` and `.jpg` (max 1600px wide). Never place a source image directly in `static/` — it will be served unoptimized and won't have a `.webp` sibling.

## The rule

```
content/{type}/{slug}/image-name.png   ← source (original, full-res)
         ↓  pnpm optimize
static/images/{type}/{slug}/image-name.webp   ← served (preferred)
static/images/{type}/{slug}/image-name.jpg    ← fallback
```

## Covered content types

| Content dir | Static output |
|---|---|
| `content/notes/{slug}/` | `static/images/notes/{slug}/` |
| `content/products/{slug}/` | `static/images/products/{slug}/` |
| `content/mailings/{slug}/` | `static/images/mailings/{slug}/` |
| `content/projects/{slug}/` | `static/images/projects/{slug}/` |
Note: `content/art/` is entirely outside the optimize pipeline — characters, environments, and scene images are all generated assets managed separately.

## Step-by-step procedure

### 1. Determine the correct content path

| Image is for… | Save source to… |
|---|---|
| A note (`/notes/008-vibin-workflow`) | `content/notes/008-vibin-workflow/` |
| A product | `content/products/{id}/` |
| A mailing | `content/mailings/{slug}/` |
| A project | `content/projects/{slug}/` |
| A reusable art library scene | `content/art/scenes/` |

### 2. Generate the image to the correct path

When calling `mcp__gemini-local__generate_image`, set `outputPath` to the `content/` location directly:

```
outputPath: content/notes/008-vibin-workflow/dexter-vibin-v2.png
```

### 3. Run optimize

```bash
pnpm optimize
```

Skips files where both `.webp` and `.jpg` already exist in `static/` — safe to run repeatedly.

### 4. Reference the static path in content

In note/product/mailing frontmatter, reference the `static/` path:

```yaml
hero: /images/notes/008-vibin-workflow/dexter-vibin-v2.webp
```

Always prefer `.webp`; the `.jpg` is a fallback for contexts that need it (e.g. OG tags).

## optimize script behaviour

- Reads `content/notes`, `content/products`, `content/mailings`, `content/projects`, `content/art/scenes`
- For each slug subdirectory → mirrors it under `static/images/{type}/{slug}/`
- Produces `.webp` (quality 80, effort 6) and `.jpg` (quality 70), max width 1600px
- Skips a file if both output formats already exist (safe to re-run)
- Does **not** delete anything from `static/` — clean up stale files manually

## Checklist for image-gen requests

- [ ] Identify content type and slug
- [ ] Set `outputPath` to `content/{type}/{slug}/`
- [ ] Generate via `mcp__gemini-local__generate_image`
- [ ] Run `pnpm optimize`
- [ ] Reference the filename in frontmatter (see below)

---

## Commissioning a hero image alongside content

When writing a note, product page, or mailing, a hero image is optional. If requested (or offered):

### 1. Pick a scene

For Dexterlabs content, use the character + environment compositor workflow from `wiki/expertise/artwork-prompts.md`:

- Pick the character sheet pose that fits the topic (e.g. `char-sitting-leaning` for a build log, `char-explaining` for a talk)
- Pick the matching environment plate (e.g. `env-pcb-bench` for hardware, `env-coding` for software)
- Or generate a new scene if none of the existing plates fit — save the new plate to `content/art/environments/` and add its prompt to `content/art/environments/prompts.md`

### 2. Generate to the content path

```
outputPath: content/notes/{slug}/hero.png   (or hero-scene.png, dexter-{topic}.png — descriptive name)
```

### 3. Run optimize

```bash
pnpm optimize
```

### 4. Update frontmatter

**Notes** — add to the `images` array (filename only, no path):
```yaml
images: [hero.webp]
```

**Products** — check the `ProductFrontmatter` type in `src/lib/types.ts` for the correct field.

**Mailings** — same pattern as notes; check the template in `content/templates/`.

### Suggested scenes by note `kind`

| kind | Character | Environment |
|---|---|---|
| `BUILD` | `char-sitting-leaning` | `env-pcb-bench` or `env-3d-print` |
| `HARDWARE` | `char-standing-34-left` | `env-scope` or `env-pcb-bench` |
| `OPEN-SOURCE` | `char-sitting-front` | `env-coding` |
| `PROJECT-LOG` | `char-arms-crossed` | `env-lab-main` |
| `TALK` | `char-explaining` | `env-lab-main` or `env-eurorack` |
