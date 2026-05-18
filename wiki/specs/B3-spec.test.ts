/**
 * B3 — Spec presence checks (criteria 19–20)
 *
 * This file is intentionally placed under `wiki/specs/` (outside `src/`) per the
 * test-writer dispatch prompt: it validates that `wiki/specs/B3-component-library-integration.md`
 * contains the Migration plan section and the expected route rows.
 *
 * NOTE — Test discovery:
 *   Vitest in this repo (see `vite.config.ts`) restricts test discovery to
 *   `src/**\/*.{test,spec}.{js,ts}`. Files under `wiki/` are therefore NOT picked
 *   up by `pnpm test` with the current config. To keep the criteria actually
 *   exercised, the same assertions are mirrored in
 *   `src/routes/(console)/order/cancel/page.test.ts` under "Section E (mirror)".
 *
 *   If the reviewer wants this file to run too, vitest's `include` globs in
 *   `vite.config.ts` would need to be widened — that is an implementation change
 *   and out of scope for the test-writer step. Flagged in the test-writer report.
 *
 * Spec: wiki/specs/B3-component-library-integration.md
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

const ROOT = resolvePath(__dirname, '../..');
const SPEC_PATH = resolvePath(ROOT, 'wiki/specs/B3-component-library-integration.md');

describe('B3 / Section E — migration plan exists in spec', () => {
	const spec = readFileSync(SPEC_PATH, 'utf8');

	it('spec contains the "## Migration plan" heading — criterion 19', () => {
		expect(spec).toMatch(/^##\s+Migration plan\s*$/m);
	});

	const ROUTES = ['/order/cancel/', '/legal/', '/about/', '/notes/', '/catalogue/', '/'];
	for (const route of ROUTES) {
		it(`spec migration plan mentions route ${route} — criterion 19`, () => {
			expect(spec.includes(route), `migration plan missing route ${route}`).toBe(true);
		});
	}
});
