# DXTR Labs Website - Development Instructions

## Critical Rules

### Svelte 5 Runes - MANDATORY
This project uses **Svelte 5.43.8** with runes. NEVER use legacy Svelte syntax.

**Required Syntax:**
- Props: `let { propName }: Props = $props()`
- State: `let count = $state(0)`
- Derived state: `let doubled = $derived(count * 2)`
- Effects: `$effect(() => { ... })`
- Event handlers: `onclick={() => ...}` (NOT `on:click`)

**Forbidden Legacy Syntax:**
- ❌ `export let prop` (use `$props()`)
- ❌ `$: doubled = count * 2` (use `$derived()`)
- ❌ `on:click` (use `onclick`)

### TypeScript
- **Always** use TypeScript for new components
- Define `Props` interface for all components that accept props
- Import types from 'svelte': `Component`, `Snippet`, etc.
- Example:
  ```typescript
  interface Props {
    title: string;
    count?: number;
  }
  let { title, count = 0 }: Props = $props();
  ```

## Code Organization

### File Structure
```
src/
├── lib/
│   ├── ui/          # Reusable UI components
│   ├── types.ts     # Shared TypeScript types
│   └── utils/       # Utility functions
├── routes/          # SvelteKit routes
│   └── (console)/   # Route group for main console UI
└── content/         # MDX/markdown content
```

### Component Patterns
- **UI Components** (`$lib/ui/`): Reusable, self-contained visual elements
- **Page Components** (`routes/`): Compose UI components, handle layout
- **Component Naming**: PascalCase (e.g., `NavCard.svelte`, `GlitchText.svelte`)

## Styling Standards

### Design Aesthetic
Cyber/terminal/retro-computing theme with:
- Monospace fonts
- CRT/terminal visual effects
- Grid-based layouts
- Glitch effects and scan lines

### CSS Approach
- Use **CSS custom properties** for theming
- Component styles are **scoped** (within `<style>` tags)
- Global variables defined in app.css:
  - `--cyber-cyan`, `--cyber-magenta`, `--cyber-red`
  - `--grid`, `--text-dim`, `--bg-primary`
  - etc.

### Style Guidelines
- Keep component styles minimal and focused
- Page components handle layout logic only
- Responsive design: mobile-first approach
- Use `clamp()` for fluid typography

## Component Development

### Creating New Components

1. **Read existing similar components first** to match patterns
2. Use TypeScript Props interface
3. Use Svelte 5 runes exclusively
4. Follow existing naming and structure conventions
5. Include scoped styles if needed

### Example Component Template
```svelte
<script lang="ts">
  interface Props {
    title: string;
    variant?: 'cyan' | 'magenta' | 'red';
  }

  let { title, variant = 'cyan' }: Props = $props();
</script>

<div class="component {variant}">
  {title}
</div>

<style>
  .component {
    /* Styles here */
  }

  .cyan { color: var(--cyber-cyan); }
  .magenta { color: var(--cyber-magenta); }
  .red { color: var(--cyber-red); }
</style>
```

## Best Practices

### Don't Over-Engineer
- Only implement what's requested
- Don't add extra features "just in case"
- Don't add unnecessary error handling or validation
- Keep abstractions minimal - three similar lines is better than premature abstraction

### Security
- Validate user input at system boundaries
- Be aware of XSS, injection vulnerabilities
- Trust internal code and framework guarantees

### Performance
- Use `$derived` for computed values (automatically memoized)
- Avoid unnecessary `$effect` calls
- Lazy load heavy components when appropriate

## Testing & Quality

### Available Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run check` - TypeScript checking
- `npm run lint` - ESLint + Prettier
- `npm run test` - Run tests

### Before Committing
- Run type checking: `npm run check`
- Run linting: `npm run lint`
- Test in browser if UI changes

## Common Tasks

### Adding a New Page
1. Create `+page.svelte` in appropriate route directory
2. Optional: `+page.ts` for load function
3. Use existing page components as reference
4. Follow layout patterns from existing pages

### Adding a New UI Component
1. Check `$lib/ui/` for similar existing components
2. Create in `$lib/ui/ComponentName.svelte`
3. Use TypeScript Props interface
4. Export from component if needed elsewhere
5. Follow existing component patterns

### Working with Content
- Content lives in `/content` directory
- Uses mdsvex for markdown processing
- Frontmatter for metadata

## Notes
- This is a personal portfolio/lab showcase site
- Focus on unique cyber aesthetic
- Modularity and clean code over complexity
