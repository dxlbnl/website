/**
 * B3 — Component library integration test suite for the proving-ground page.
 *
 * Spec: wiki/specs/B3-component-library-integration.md
 * Item: wiki/backlog/doing/B3-component-library-integration.md
 *
 * These are file-content / static-analysis tests. They do NOT spawn subprocesses.
 *
 * Out-of-scope here (run by the reviewer, not Vitest):
 *   - `pnpm check`  (svelte-check)            — criterion 3 (compile-time TS check)
 *   - `pnpm build`  (vite build / prerender)  — criterion 4 (build success)
 *   - Palette runtime behaviour                — criterion 6, 13 (needs a browser)
 *   - Back-link navigation smoke test         — criterion 12 (kit utils / browser test)
 *
 * Sections map to the spec:
 *   A — Library installed and importable (criteria 1–4 file-level slice)
 *   B — Global CSS / token wiring (criteria 5–9 file-level slice)
 *   C — First page rendered entirely through @dxlbnl/ui (criteria 10–15)
 *   D — Gap tracking (criteria 16–18)
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, statSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ROOT = resolvePath(__dirname, '../../../../..');

function read(rel: string): string {
	return readFileSync(resolvePath(ROOT, rel), 'utf8');
}

/**
 * Strip <script>…</script> (with optional attrs like lang="ts") and
 * <svelte:head>…</svelte:head> from a Svelte file, leaving the template region.
 * Per the spec, criterion (10) regex assertions apply to the template region only.
 */
function templateRegion(src: string): string {
	return src
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
		.replace(/<svelte:head>[\s\S]*?<\/svelte:head>/gi, '');
}

const PAGE_PATH = 'src/routes/(console)/order/cancel/+page.svelte';
const APP_CSS_PATH = 'src/app.css';
const PKG_PATH = 'package.json';
const LOCK_PATH = 'pnpm-lock.yaml';

// ---------------------------------------------------------------------------
// Section A — Library installed and importable
// ---------------------------------------------------------------------------

describe('B3 / Section A — @dxlbnl/ui is installed and pinned', () => {
	const pkg = JSON.parse(read(PKG_PATH)) as {
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};

	it('@dxlbnl/ui is in dependencies (not devDependencies) — criterion 1', () => {
		expect(pkg.dependencies?.['@dxlbnl/ui']).toBeDefined();
		expect(pkg.devDependencies?.['@dxlbnl/ui']).toBeUndefined();
	});

	it('@dxlbnl/ui version is pinned (no *, latest, or workspace:*) — criterion 1', () => {
		const v = pkg.dependencies?.['@dxlbnl/ui'] ?? '';
		expect(v).not.toBe('');
		expect(v).not.toBe('*');
		expect(v).not.toBe('latest');
		expect(v.startsWith('workspace:')).toBe(false);
		// Per resolved Q7, caret on 1.x is acceptable; assert it satisfies that shape
		// or is a stricter pin (exact / tilde / range with numbers).
		expect(v).toMatch(/^[\^~]?\d+(\.\d+){0,2}([-+][\w.+-]+)?$/);
	});

	it('pnpm-lock.yaml has an entry for @dxlbnl/ui — criterion 2', () => {
		const lock = read(LOCK_PATH);
		expect(lock).toMatch(/'@dxlbnl\/ui':/);
		expect(lock).toMatch(/@dxlbnl\/ui@\d/);
	});

	it('the proving-ground route imports a named export from @dxlbnl/ui — criterion 3', () => {
		const src = read(PAGE_PATH);
		// Named import from @dxlbnl/ui or a subpath. Must contain at least one identifier
		// inside the braces — not a bare side-effect import.
		expect(src).toMatch(/import\s*\{[^}]+\}\s*from\s*['"]@dxlbnl\/ui(?:\/[\w/-]+)?['"]/);
	});
});

// ---------------------------------------------------------------------------
// Section B — Global CSS / token wiring
// ---------------------------------------------------------------------------

describe('B3 / Section B — app.css wires @dxlbnl/ui tokens before site tokens', () => {
	const css = read(APP_CSS_PATH);

	it('first non-comment line imports @dxlbnl/ui/tokens/tokens.css — criterion 5', () => {
		// Strip leading whitespace + /* ... */ block comments at the top of the file.
		let body = css;
		// Repeatedly peel leading whitespace and block comments.
		while (true) {
			const trimmed = body.replace(/^\s+/, '');
			if (trimmed.startsWith('/*')) {
				const end = trimmed.indexOf('*/');
				if (end === -1) break;
				body = trimmed.slice(end + 2);
				continue;
			}
			body = trimmed;
			break;
		}
		const firstLine = body.split('\n', 1)[0]?.trim() ?? '';
		expect(firstLine).toMatch(/^@import\s+['"]@dxlbnl\/ui\/tokens\/tokens\.css['"]\s*;?$/);
	});

	it('tokens.css import appears before the first :root block — criterion 5', () => {
		const importIdx = css.search(/@import\s+['"]@dxlbnl\/ui\/tokens\/tokens\.css['"]/);
		const rootIdx = css.search(/:root\s*\{/);
		expect(importIdx).toBeGreaterThanOrEqual(0);
		expect(rootIdx).toBeGreaterThanOrEqual(0);
		expect(importIdx).toBeLessThan(rootIdx);
	});

	it('app.css does NOT import @dxlbnl/ui/tokens/typography.css — criterion 5 addendum', () => {
		expect(css).not.toMatch(/@import\s+['"]@dxlbnl\/ui\/tokens\/typography\.css['"]/);
	});

	// Criterion 7 — site tokens remain defined.
	const REQUIRED_TOKENS = [
		'--bg',
		'--ink',
		'--amber',
		'--cyan',
		'--rule',
		'--mono',
		'--sans',
		'--t-body',
		'--t-h1',
		'--u',
		'--radius',
		'--radius-card',
	];
	for (const token of REQUIRED_TOKENS) {
		it(`app.css still defines ${token} — criterion 7`, () => {
			// Look for the token as a CSS property (followed by ':')
			const re = new RegExp(`${token.replace(/[-]/g, '\\-')}\\s*:`);
			expect(css).toMatch(re);
		});
	}

	it('paper palette block still exists — criterion 7', () => {
		expect(css).toMatch(/\[data-palette\s*=\s*['"]paper['"]\]\s*\{/);
	});

	// TODO(B3): palette runtime check (criterion 6) and amber-in-both-palettes (13)
	// are reviewer-verified via a manual visit. Not unit-testable without a browser.
});

// ---------------------------------------------------------------------------
// Section C — First page rendered entirely through @dxlbnl/ui
// ---------------------------------------------------------------------------

describe('B3 / Section C — /order/cancel/ rendered entirely through @dxlbnl/ui', () => {
	const src = read(PAGE_PATH);
	const tmpl = templateRegion(src);

	it('has zero <style> blocks anywhere in the file — criterion 10', () => {
		expect(src).not.toMatch(/<style[\s>]/);
	});

	it('has zero style="..." attributes in the template region — criterion 10', () => {
		expect(tmpl).not.toMatch(/\sstyle=/);
	});

	const FORBIDDEN_TAGS = [
		'div',
		'section',
		'main',
		'article',
		'header',
		'footer',
		'nav',
		'aside',
		'p',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'span',
		'ul',
		'ol',
		'li',
		'a',
		'button',
		'img',
		'figure',
		'figcaption',
		'form',
		'input',
		'label',
		'br',
		'hr',
	];
	for (const tag of FORBIDDEN_TAGS) {
		it(`template region contains no raw <${tag}> tag — criterion 10`, () => {
			// Case-sensitive: PascalCase library components must not be falsely flagged as their lowercase HTML namesakes.
			const re = new RegExp(`<${tag}(?=[\\s/>])`);
			const match = re.exec(tmpl);
			expect(match, `forbidden HTML tag <${tag}> found in template region`).toBeNull();
		});
	}

	it('no imports from $lib/ui/... — criterion 10', () => {
		expect(src).not.toMatch(/from\s+['"]\$lib\/ui\//);
	});

	it('no imports from $lib/styles/... — criterion 10', () => {
		expect(src).not.toMatch(/from\s+['"]\$lib\/styles\//);
	});

	it('has at least one import from @dxlbnl/ui — criterion 10', () => {
		expect(src).toMatch(/from\s+['"]@dxlbnl\/ui(?:\/[\w/-]+)?['"]/);
	});

	// Criterion 11 — content preservation. Each phrase its own test.
	const CONTENT_PHRASES: Array<[string, string]> = [
		['Order Cancelled', 'page title'],
		['Your order was not completed. No charge was made.', 'meta description'],
		['No charge made.', 'visible heading'],
		['ORDER CANCELLED', 'eyebrow label'],
		[
			"You cancelled the checkout. Nothing was charged. Head back to the catalogue if you'd like to try again.",
			'body copy',
		],
		['RETURN TO CATALOGUE', 'back-link label'],
		['// SIGNED', 'signature: signed eyebrow'],
		['// SHIPPED BY', 'signature: shipped-by eyebrow'],
		['Dexter, in the lab', 'signature: signed line'],
		['DEXTERLABS', 'signature: shipped-by line'],
	];
	for (const [phrase, label] of CONTENT_PHRASES) {
		it(`file preserves "${label}": ${JSON.stringify(phrase)} — criterion 11`, () => {
			expect(src.includes(phrase), `expected to find ${label} in +page.svelte`).toBe(true);
		});
	}

	it('back link targets /catalogue/ — criterion 11', () => {
		// Accept href="/catalogue/", href={resolve('/catalogue/')}, href={'/catalogue/'}
		const patterns = [
			/href=["']\/catalogue\/["']/,
			/href=\{\s*resolve\(\s*['"]\/catalogue\/['"]\s*\)\s*\}/,
			/href=\{\s*['"]\/catalogue\/['"]\s*\}/,
		];
		const ok = patterns.some((re) => re.test(src));
		expect(ok, 'no /catalogue/ href found on +page.svelte').toBe(true);
	});

	it('<svelte:head> contains <title>Order Cancelled</title> — criterion 15', () => {
		const head = /<svelte:head>([\s\S]*?)<\/svelte:head>/.exec(src);
		expect(head, 'no <svelte:head> block found').not.toBeNull();
		const inner = head?.[1] ?? '';
		expect(inner).toMatch(/<title>\s*Order Cancelled\s*<\/title>/);
	});

	it('<svelte:head> contains a description meta tag — criterion 15', () => {
		const head = /<svelte:head>([\s\S]*?)<\/svelte:head>/.exec(src);
		expect(head, 'no <svelte:head> block found').not.toBeNull();
		const inner = head?.[1] ?? '';
		expect(inner).toMatch(/<meta\s+name=["']description["']/i);
		expect(inner).toMatch(/Your order was not completed\. No charge was made\./);
	});

	// Criterion 14 — src/lib/ui/ legacy components remain untouched.
	for (const legacy of ['Led.svelte', 'Signature.svelte', 'SEO.svelte']) {
		it(`legacy src/lib/ui/${legacy} still exists and is non-empty — criterion 14`, () => {
			const p = resolvePath(ROOT, 'src/lib/ui', legacy);
			const stat = statSync(p);
			expect(stat.isFile()).toBe(true);
			expect(stat.size).toBeGreaterThan(0);
		});
	}
});

// ---------------------------------------------------------------------------
// Section D — Gap tracking
// ---------------------------------------------------------------------------

describe('B3 / Section D — gap tracking is consistent with the migrated page', () => {
	it('either /order/cancel/ has a gap row, or progress.md notes "no gaps logged" — criteria 16–18', () => {
		const missing = read('wiki/missing-components.md');
		const progress = read('wiki/progress.md');

		// Look only at the "Open gaps" section (between its heading and the next heading).
		const openSection = /##\s+Open gaps\s*\n([\s\S]*?)(?=\n##\s|$)/.exec(missing);
		const openBody = openSection?.[1] ?? '';
		const hasOrderCancelGap = /\/order\/cancel\//.test(openBody);

		const NOTE = 'B3: /order/cancel/ migrated to @dxlbnl/ui with no gaps logged.';
		const hasProgressNote = progress.includes(NOTE);

		// At least one must be true: a logged gap, or the progress note.
		expect(
			hasOrderCancelGap || hasProgressNote,
			'expected either an /order/cancel/ row in wiki/missing-components.md "Open gaps", ' +
				`or the exact one-liner in wiki/progress.md: ${JSON.stringify(NOTE)}`,
		).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// Section E mirror — spec presence checks (criteria 19–20)
//
// These also live in wiki/specs/B3-spec.test.ts per the manager's instruction.
// We duplicate them here because Vitest's `include` glob is scoped to `src/**`
// (see vite.config.ts), so a test file under wiki/ will not be discovered.
// Removing the test file in wiki/ would obscure the spec-presence intent; running
// these mirrors here ensures the criteria are actually exercised.
// ---------------------------------------------------------------------------

describe('B3 / Section E (mirror) — migration plan exists in spec', () => {
	const spec = read('wiki/specs/B3-component-library-integration.md');

	it('spec contains the "## Migration plan" heading — criterion 19', () => {
		expect(spec).toMatch(/^##\s+Migration plan\s*$/m);
	});

	const ROUTES = ['/order/cancel/', '/legal/', '/about/', '/notes/', '/catalogue/', '/'];
	for (const route of ROUTES) {
		it(`spec migration plan mentions route ${route} — criterion 19`, () => {
			// Plain substring presence anywhere in the spec.
			expect(spec.includes(route), `migration plan missing route ${route}`).toBe(true);
		});
	}
});
