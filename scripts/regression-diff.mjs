#!/usr/bin/env node
// regression-diff.mjs — visual regression diff for the @dxlbnl/ui migration.
//
// Usage:
//   node scripts/regression-diff.mjs scripts/regression-configs/<page>.js
//   (or)  pnpm regression:diff scripts/regression-configs/<page>.js
//
// Loads the config, opens both URLs in headless Chromium via Playwright,
// captures a small set of computed styles per named component on each side,
// and writes a Markdown report to
// /home/dexter/Projects/Web/dxlb-ui/wiki/backlog/inbox/regression-<pageSlug>.md
//
// Exit code 0 when zero findings remain (page matches production); non-zero
// when there are findings, so the loop can be one-lined:
//   pnpm regression:diff … && echo green
//
// Config shape (see scripts/regression-configs/order-cancel.js):
//   export default {
//     pageSlug: 'order-cancel',
//     liveUrl: 'https://...',
//     localUrl: 'http://localhost:5174/...',
//     components: [{ name, live, local, notes? }, ...],
//     // optional: extra notes appended to the report's Description section
//     description?: string,
//   }

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const STYLE_PROPS = [
	'display',
	'font-family',
	'font-size',
	'font-weight',
	'line-height',
	'letter-spacing',
	'text-transform',
	'color',
	'background-color',
	'padding-top',
	'padding-right',
	'padding-bottom',
	'padding-left',
	'margin-top',
	'margin-right',
	'margin-bottom',
	'margin-left',
	'max-width',
	'width',
	'gap',
	'grid-template-columns',
	'border-top-width',
	'border-top-style',
	'border-top-color',
	'border-radius'
];

const DXLB_INBOX =
	'/home/dexter/Projects/Web/dxlb-ui/wiki/backlog/inbox';

const today = () => new Date().toISOString().slice(0, 10);

async function loadConfig(arg) {
	if (!arg) {
		console.error(
			'usage: node scripts/regression-diff.mjs <config-path>\n' +
				'  e.g. pnpm regression:diff scripts/regression-configs/order-cancel.js'
		);
		process.exit(2);
	}
	const path = resolve(process.cwd(), arg);
	const mod = await import(pathToFileURL(path).href);
	const cfg = mod.default ?? mod;
	if (!cfg?.pageSlug || !cfg?.liveUrl || !cfg?.localUrl || !Array.isArray(cfg.components)) {
		console.error(`config ${path} missing required fields (pageSlug, liveUrl, localUrl, components[])`);
		process.exit(2);
	}
	return cfg;
}

async function captureStyles(page, components, side) {
	const out = {};
	for (const c of components) {
		const selector = c[side];
		const styles = await page.evaluate(
			({ selector, props }) => {
				const el = document.querySelector(selector);
				if (!el) return { __missing: true };
				const cs = window.getComputedStyle(el);
				const o = {};
				for (const p of props) o[p] = cs.getPropertyValue(p).trim();
				return o;
			},
			{ selector, props: STYLE_PROPS }
		);
		out[c.name] = { selector, styles };
	}
	return out;
}

function diffComponent(liveStyles, localStyles) {
	if (liveStyles.__missing) return { error: `selector did not match on live page` };
	if (localStyles.__missing) return { error: `selector did not match on local page` };
	const diffs = [];
	for (const p of STYLE_PROPS) {
		const live = liveStyles[p];
		const local = localStyles[p];
		if (live === local) continue;
		if (live === '' && local === '') continue;
		diffs.push({ property: p, local, live });
	}
	return { diffs };
}

function renderReport(cfg, results) {
	const date = today();
	const id = `REG-${cfg.pageSlug}-${date}`;
	const lines = [];
	lines.push('---');
	lines.push(`id: ${id}`);
	lines.push(`title: "Regression — ${cfg.localUrl.replace(/^https?:\/\/[^/]+/, '')} on dexterlabs.nl"`);
	lines.push('type: bug');
	lines.push('priority: high');
	lines.push('flags: []');
	lines.push(`created: ${date}`);
	lines.push('---');
	lines.push('');
	lines.push('## Description');
	lines.push('');
	lines.push(
		`Computed-style regressions captured from \`${cfg.localUrl}\` (post-migration to \`@dxlbnl/ui\`) ` +
			`against \`${cfg.liveUrl}\` (live production). Each finding lists what the new page renders and ` +
			'what production renders for the same property. Library fixes should make the right-hand value ' +
			'match the left-hand value (or update production via a separate decision).'
	);
	if (cfg.description) {
		lines.push('');
		lines.push(cfg.description);
	}
	lines.push('');

	let totalFindings = 0;
	const errored = [];

	lines.push('## Findings');
	lines.push('');

	for (const { component, result } of results) {
		if (result.error) {
			errored.push({ component, error: result.error });
			continue;
		}
		if (result.diffs.length === 0) continue;
		totalFindings += result.diffs.length;
		lines.push(`### ${component.name} (\`${component.local}\`)`);
		if (component.notes) lines.push(`> ${component.notes}`);
		lines.push('');
		for (const d of result.diffs) {
			lines.push(`- \`${d.property}\`: ${formatValue(d.local)} → should be ${formatValue(d.live)}`);
		}
		lines.push('');
	}

	if (totalFindings === 0 && errored.length === 0) {
		lines.push('_No differences detected. The page matches production for the captured property set._');
		lines.push('');
	}

	if (errored.length) {
		lines.push('## Selector errors');
		lines.push('');
		lines.push(
			'These components could not be measured because their selector did not match on one side. ' +
				'Likely the regression config needs updating or the migrated page does not yet render the surface.'
		);
		lines.push('');
		for (const e of errored) {
			lines.push(`- **${e.component.name}** — live \`${e.component.live}\`, local \`${e.component.local}\` — ${e.error}`);
		}
		lines.push('');
	}

	lines.push('## Verification');
	lines.push('');
	lines.push(
		'Once the library is fixed and a fresh \`dist/\` is built, re-running ' +
			'\`pnpm regression:diff scripts/regression-configs/' +
			`${cfg.pageSlug}.js\` in the website repo should leave this file with an empty "Findings" ` +
			'section. Exit code 0 = green.'
	);
	lines.push('');

	return { md: lines.join('\n'), totalFindings, errored };
}

function formatValue(v) {
	if (v === '' || v == null) return '_(empty)_';
	return `\`${v}\``;
}

async function main() {
	const cfg = await loadConfig(process.argv[2]);

	console.log(`[regression-diff] ${cfg.pageSlug}`);
	console.log(`  live:  ${cfg.liveUrl}`);
	console.log(`  local: ${cfg.localUrl}`);
	console.log(`  components: ${cfg.components.length}`);

	const browser = await chromium.launch();
	let liveStyles, localStyles;
	try {
		const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
		const liveP = await ctx.newPage();
		const localP = await ctx.newPage();
		await Promise.all([
			liveP.goto(cfg.liveUrl, { waitUntil: 'networkidle' }),
			localP.goto(cfg.localUrl, { waitUntil: 'networkidle' })
		]);
		liveStyles = await captureStyles(liveP, cfg.components, 'live');
		localStyles = await captureStyles(localP, cfg.components, 'local');
	} finally {
		await browser.close();
	}

	const results = cfg.components.map((component) => ({
		component,
		result: diffComponent(liveStyles[component.name].styles, localStyles[component.name].styles)
	}));

	const { md, totalFindings, errored } = renderReport(cfg, results);

	const outPath = `${DXLB_INBOX}/regression-${cfg.pageSlug}.md`;
	writeFileSync(outPath, md);

	console.log('');
	console.log(`[regression-diff] wrote ${outPath}`);
	console.log(
		`  findings: ${totalFindings}, errored selectors: ${errored.length}, components compared: ${cfg.components.length}`
	);

	if (totalFindings > 0 || errored.length > 0) {
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('[regression-diff] failed:', err);
	process.exit(2);
});
