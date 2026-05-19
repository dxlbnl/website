#!/usr/bin/env node
// regression-diff.mjs — visual regression diff for the @dxlbnl/ui migration.
//
// Usage:
//   pnpm regression:diff scripts/regression-configs/<page>.js
//     → writes a report to /tmp/regression-<pageSlug>.md (for review)
//
//   pnpm regression:diff scripts/regression-configs/<page>.js --push
//     → also writes the report to dxlb-ui's backlog inbox so its Vibin
//       manager picks it up as a bug item
//
// Exit code: 0 when zero findings remain, 1 if findings remain, 2 on error.
//
// Config shape (see scripts/regression-configs/order-cancel.js):
//   export default {
//     pageSlug:   'order-cancel',
//     liveUrl:    'https://...',
//     localUrl:   'http://localhost:5174/...',
//     description?: '<extra context appended to report>',
//     components: [
//       {
//         name:           'eyebrow text',          // human-readable surface name
//         live:           '.wrap .label',          // selector on production
//         local:          '.inline .eyebrow',      // selector on dev
//         component?:     'Text',                  // library component responsible (annotation)
//         variant?:       'eyebrow',               // variant of that component (annotation)
//         propertyGroups?: ['text'],               // restrict diff to these groups (default: all)
//         ignore?:        ['margin-bottom'],       // never flag these properties
//         notes?:         '<one-line note>'
//       },
//       …
//     ]
//   }

import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const STYLE_GROUPS = {
	text: [
		'font-family',
		'font-size',
		'font-weight',
		'line-height',
		'letter-spacing',
		'text-transform',
		'color'
	],
	layout: [
		'display',
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
		'grid-template-columns'
	],
	border: [
		'border-top-width',
		'border-top-style',
		'border-top-color',
		'border-radius'
	],
	background: ['background-color']
};

const ALL_GROUPS = Object.keys(STYLE_GROUPS);
const ALL_PROPS = ALL_GROUPS.flatMap((g) => STYLE_GROUPS[g]);

const DXLB_INBOX = '/home/dexter/Projects/Web/dxlb-ui/wiki/backlog/inbox';

const today = () => new Date().toISOString().slice(0, 10);

function propsFor(component) {
	const groups = component.propertyGroups?.length ? component.propertyGroups : ALL_GROUPS;
	const ignore = new Set(component.ignore ?? []);
	const out = [];
	for (const g of groups) {
		if (!STYLE_GROUPS[g]) {
			console.warn(`[regression-diff] unknown property group "${g}" on component "${component.name}"`);
			continue;
		}
		for (const p of STYLE_GROUPS[g]) if (!ignore.has(p)) out.push(p);
	}
	return out;
}

async function loadConfig(arg) {
	if (!arg) {
		console.error('usage: pnpm regression:diff scripts/regression-configs/<page>.js [--push]');
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

async function captureFor(page, components, side) {
	const out = {};
	for (const c of components) {
		const selector = c[side];
		const props = propsFor(c);
		const styles = await page.evaluate(
			({ selector, props }) => {
				const el = document.querySelector(selector);
				if (!el) return { __missing: true };
				const cs = window.getComputedStyle(el);
				const o = {};
				for (const p of props) o[p] = cs.getPropertyValue(p).trim();
				return o;
			},
			{ selector, props }
		);
		out[c.name] = styles;
	}
	return out;
}

function diffComponent(liveStyles, localStyles, component) {
	if (liveStyles.__missing) return { error: `selector "${component.live}" did not match on live page` };
	if (localStyles.__missing) return { error: `selector "${component.local}" did not match on local page` };
	const diffs = [];
	for (const p of propsFor(component)) {
		const live = liveStyles[p];
		const local = localStyles[p];
		if (live === local) continue;
		if (live === '' && local === '') continue;
		diffs.push({ property: p, local, live });
	}
	return { diffs };
}

function formatValue(v) {
	if (v === '' || v == null) return '_(empty)_';
	return `\`${v}\``;
}

function componentTag(c) {
	if (!c.component) return '';
	const props = c.props ? ` ${c.props}` : '';
	return ` — \`<${c.component}${props}>\``;
}

function renderReport(cfg, results) {
	const date = today();
	const id = `REG-${cfg.pageSlug}-${date}`;
	const route = cfg.localUrl.replace(/^https?:\/\/[^/]+/, '');
	const lines = [];
	lines.push('---');
	lines.push(`id: ${id}`);
	lines.push(`title: "Regression — ${route} on dexterlabs.nl"`);
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
			'match the left-hand value.'
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
		lines.push(`### ${component.name}${componentTag(component)} (\`${component.local}\`)`);
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
		'Once the library is fixed and a fresh `dist/` is built, re-running ' +
			'`pnpm regression:diff scripts/regression-configs/' +
			`${cfg.pageSlug}.js\` in the website repo should leave this file with an empty "Findings" ` +
			'section. Exit code 0 = green.'
	);
	lines.push('');

	return { md: lines.join('\n'), totalFindings, errored };
}

async function main() {
	const args = process.argv.slice(2);
	const push = args.includes('--push');
	const configArg = args.find((a) => !a.startsWith('--'));
	const cfg = await loadConfig(configArg);

	console.log(`[regression-diff] ${cfg.pageSlug}${push ? ' (push)' : ''}`);
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
		liveStyles = await captureFor(liveP, cfg.components, 'live');
		localStyles = await captureFor(localP, cfg.components, 'local');
	} finally {
		await browser.close();
	}

	const results = cfg.components.map((component) => ({
		component,
		result: diffComponent(liveStyles[component.name], localStyles[component.name], component)
	}));

	const { md, totalFindings, errored } = renderReport(cfg, results);

	const stagingPath = `/tmp/regression-${cfg.pageSlug}.md`;
	writeFileSync(stagingPath, md);
	console.log(`\n[regression-diff] staging report: ${stagingPath}`);

	if (push) {
		const inboxPath = `${DXLB_INBOX}/regression-${cfg.pageSlug}.md`;
		writeFileSync(inboxPath, md);
		console.log(`[regression-diff] pushed to dxlb-ui inbox: ${inboxPath}`);
	} else {
		console.log('[regression-diff] not pushed — review the staging file then re-run with --push');
	}

	console.log(
		`  findings: ${totalFindings}, errored selectors: ${errored.length}, components compared: ${cfg.components.length}`
	);

	if (totalFindings > 0 || errored.length > 0) process.exit(1);
}

main().catch((err) => {
	console.error('[regression-diff] failed:', err);
	process.exit(2);
});
