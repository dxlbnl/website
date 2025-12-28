# Project Context

## Purpose
Personal portfolio and lab showcase website for DXTR Labs. Features work in coding, hardware design (Eurorack), and generative art.

## Design Aesthetic
**Cyber/terminal/retro-computing theme:**
- CRT monitor effects (scan lines, glitch)
- Monospace fonts
- Terminal-style UI
- Color palette: cyan, magenta, red accents on dark background
- Grid-based layouts
- "Hacker console" vibe

## Site Structure & Page Types
Three-template architecture:

1. **The Console** (`pageType: console`) - `/`
   - Main hub with identity and navigation
   - Implemented ✓

2. **The Repository** (`pageType: repository`) - `/repository`
   - Blog/technical logs/project data
   - Planned

3. **The Catalogue** (`pageType: catalogue`) - `/catalogue`
   - Product shop (Eurorack modules, hardware)
   - Links to Tindie for actual sales
   - Planned ← CURRENT FOCUS

4. **Art Grid** - `/art`
   - Generative art gallery
   - Planned

## Existing UI Components
Located in `src/lib/ui/`:
- CrtOverlay - Visual CRT/scan line effects
- GlitchText - Animated glitchy text effect
- NavCard - Navigation cards with variants (cyan/red/magenta)
- SocialUplink - Social media links styled as network uplinks
- HudHeader - Top system header bar
- HudLabel - Label component

## Content Strategy
- Uses mdsvex (0.12.6) for markdown → Svelte component conversion
- Content stored in `/content` directory
- Build-time static generation via `import.meta.glob` (no runtime fetching)
- Frontmatter for metadata (typed interfaces in types.ts)
- Current: ConsoleFrontmatter type
- Structure: `/content/products/` for product listings

## Key Features
- Modular component system
- Responsive design
- Terminal/console aesthetic throughout
- Clean, focused implementations (no over-engineering)
