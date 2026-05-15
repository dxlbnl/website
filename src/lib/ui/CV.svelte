<script lang="ts">
	import { browser } from '$app/environment';
	import type { Component } from 'svelte';
	import type { CVFrontmatter } from '$lib/types';

	type Props = { component: Component; metadata: CVFrontmatter };
	let { component: Content }: Props = $props();

	let theme = $state(browser ? (localStorage.getItem('cv-theme') ?? 'dark') : 'dark');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		if (browser) localStorage.setItem('cv-theme', theme);
	}
</script>

<div class="cv-viewer" data-cv-theme={theme}>
	<div class="cv-card">
		<div class="cv-sysline">// ALEXANDER ESSELINK · CV · 2026</div>

		<div class="cv-toolbar">
			<button class="print-btn" onclick={() => window.print()}>PRINT →</button>
			<button class="theme-toggle" onclick={toggleTheme} title="Toggle theme">◐</button>
		</div>

		<div class="cv-body">
			<Content />
		</div>

		<footer class="cv-footer">
			<span class="cv-footer-sig">— Alexander, available for new work</span>
			<span class="cv-footer-sys">DEXTERLABS / DELFT, NL</span>
		</footer>
	</div>
</div>

<style>
	/* ── THEME VARIABLES ─────────────────────────────────────── */
	.cv-viewer {
		--cv-bg: #f7f5f0;
		--cv-text: #1a1916;
		--cv-muted: #7a7870;
		--cv-border: #dedad2;
		--cv-tag-bg: #e8e5de;
		--cv-tag-text: #3a3830;
		--cv-outer: #2a2720;
		--cv-shadow: rgba(0, 0, 0, 0.35);
	}
	.cv-viewer[data-cv-theme='dark'] {
		--cv-bg: #0f0e0b;
		--cv-text: #e2ddd5;
		--cv-muted: #7a7870;
		--cv-border: #252320;
		--cv-tag-bg: #2a2820;
		--cv-tag-text: #c8c4bc;
		--cv-outer: #080705;
		--cv-shadow: rgba(0, 0, 0, 0.6);
	}

	/* ── PDF CHROME ──────────────────────────────────────────── */
	.cv-viewer {
		min-height: 100vh;
		background: var(--cv-outer);
		padding: 40px 24px 80px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 15px;
		line-height: 1.6;
		-webkit-font-smoothing: antialiased;
	}
	.cv-card {
		max-width: 820px;
		margin: 0 auto;
		background: var(--cv-bg);
		color: var(--cv-text);
		padding: 48px 48px 72px;
		box-shadow: 0 8px 48px var(--cv-shadow);
		position: relative;
		transition:
			background 0.2s,
			color 0.2s;
	}

	/* ── SYSLINE ─────────────────────────────────────────────── */
	.cv-sysline {
		font-size: 0.8rem;
		color: var(--cv-muted);
		letter-spacing: 0.04rem;
		margin-bottom: 16px;
	}

	/* ── TOOLBAR ─────────────────────────────────────────────── */
	.cv-toolbar {
		position: absolute;
		top: 48px;
		right: 48px;
		display: flex;
		gap: 6px;
	}
	.print-btn,
	.theme-toggle {
		background: none;
		border: 1px solid var(--cv-border);
		color: var(--cv-muted);
		font-family: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		padding: 4px 8px;
		line-height: 1;
		transition:
			border-color 0.15s,
			color 0.15s;
	}
	.print-btn:hover,
	.theme-toggle:hover {
		color: var(--cv-text);
		border-color: var(--cv-muted);
	}

	/* ── FOOTER ──────────────────────────────────────────────── */
	.cv-footer {
		margin-top: 48px;
		padding-top: 20px;
		border-top: 1px solid var(--cv-border);
		font-size: 0.78rem;
		color: var(--cv-muted);
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
	.cv-footer-sig {
		font-style: italic;
	}
	.cv-footer-sys {
		letter-spacing: 0.06rem;
	}

	/* ── MARKDOWN BODY ───────────────────────────────────────── */

	/* h1: name */
	.cv-body :global(h1) {
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.02rem;
		line-height: 1.1;
		margin: 0 0 4px;
		/* leave right margin for the absolutely-positioned toolbar */
		padding-right: 120px;
	}

	/* paragraphs right after h1: title/location + contact */
	.cv-body :global(h1 + p) {
		font-size: 0.95rem;
		color: var(--cv-muted);
		margin-bottom: 6px;
	}
	.cv-body :global(h1 + p + p) {
		font-size: 0.82rem;
		color: var(--cv-muted);
		margin-bottom: 0;
	}
	.cv-body :global(h1 + p + p a) {
		color: var(--cv-muted);
		text-decoration: none;
	}
	.cv-body :global(h1 + p + p a:hover) {
		color: var(--cv-text);
	}

	/* hr: divider after contact block */
	.cv-body :global(hr) {
		border: none;
		border-top: 1px solid var(--cv-border);
		margin: 20px 0 28px;
	}

	/* h2: section headers */
	.cv-body :global(h2) {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--cv-text);
		padding-bottom: 8px;
		border-bottom: 1px solid var(--cv-border);
		margin: 36px 0 16px;
	}
	.cv-body :global(h2)::before {
		content: '// ';
		color: var(--cv-muted);
		font-weight: 300;
	}

	/* h3: company/project/talk + inline em (dates/venue/stack) */
	.cv-body :global(h3) {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		margin: 24px 0 2px;
	}
	.cv-body :global(h3 em) {
		font-style: normal;
		font-weight: 400;
		font-size: 0.8rem;
		color: var(--cv-muted);
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* meta/role line: pure-em paragraph directly after h3 */
	.cv-body :global(h3 + p:has(> em:only-child)) {
		font-size: 0.82rem;
		color: var(--cv-muted);
		font-style: italic;
		margin: 2px 0 8px;
	}
	.cv-body :global(h3 + p:has(> em:only-child) a) {
		color: var(--cv-muted);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	/* regular paragraphs (summary, project descriptions, learning) */
	.cv-body :global(p) {
		font-size: 0.88rem;
		line-height: 1.7;
		margin-bottom: 10px;
		color: var(--cv-text);
	}

	/* selected stack line (strong-prefixed paragraph in summary) */
	.cv-body :global(p:has(> strong:first-child):not(:has(> code))) {
		font-size: 0.82rem;
		color: var(--cv-muted);
	}
	.cv-body :global(p:has(> strong:first-child):not(:has(> code)) > strong) {
		font-weight: 600;
		letter-spacing: 0.04em;
		color: var(--cv-muted);
	}

	/* bullet lists */
	.cv-body :global(ul) {
		list-style: none;
		padding: 0;
		margin: 0 0 4px;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.cv-body :global(li) {
		font-size: 0.83rem;
		line-height: 1.65;
		padding-left: 14px;
		position: relative;
		color: var(--cv-text);
	}
	.cv-body :global(li::before) {
		content: '—';
		position: absolute;
		left: 0;
		color: var(--cv-muted);
		font-weight: 300;
	}

	/* stack bullets: li with inline code tags */
	.cv-body :global(li:has(> code)) {
		padding-left: 0;
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		align-items: center;
		margin-top: 6px;
	}
	.cv-body :global(li:has(> code)::before) {
		display: none;
	}
	.cv-body :global(li:has(> code) > strong) {
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.06em;
		color: var(--cv-muted);
		margin-right: 2px;
	}
	.cv-body :global(li:has(> code) > code) {
		background: var(--cv-tag-bg);
		color: var(--cv-tag-text);
		padding: 1px 6px;
		border: none;
		border-radius: 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.82rem;
		white-space: nowrap;
	}

	/* bold names in freelance/earlier bullets */
	.cv-body :global(li > strong) {
		font-weight: 600;
		color: var(--cv-text);
	}

	/* skills section: paragraphs with bold label + code tags */
	.cv-body :global(p:has(> strong:first-child):has(> code)) {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		margin-bottom: 6px;
	}
	.cv-body :global(p:has(> strong:first-child):has(> code) > strong) {
		min-width: 80px;
		font-size: 0.78rem;
		font-weight: 500;
		letter-spacing: 0.08em;
		color: var(--cv-muted);
		flex-shrink: 0;
	}
	.cv-body :global(p:has(> strong:first-child):has(> code) > code) {
		background: var(--cv-tag-bg);
		color: var(--cv-tag-text);
		padding: 1px 6px;
		border: none;
		border-radius: 0;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.82rem;
		white-space: nowrap;
	}

	/* ── RESPONSIVE ──────────────────────────────────────────── */
	@media (max-width: 600px) {
		.cv-card {
			padding: 28px 20px 56px;
		}
		.cv-toolbar {
			top: 28px;
			right: 20px;
		}
		.cv-body :global(h1) {
			padding-right: 90px;
			font-size: 1.6rem;
		}
		.cv-body :global(h3) {
			flex-direction: column;
			gap: 0;
		}
	}

	/* ── PRINT ───────────────────────────────────────────────── */
	@page {
		size: A4;
		margin: 16mm 20mm 16mm 20mm;
	}

	@media print {
		.cv-viewer,
		.cv-viewer[data-cv-theme='dark'] {
			--cv-bg: #ffffff;
			--cv-text: #0e0d0b;
			--cv-muted: #585550;
			--cv-border: #c8c4bc;
			--cv-tag-bg: #ebe8e2;
			--cv-tag-text: #2e2c28;
		}
		.cv-viewer {
			background: #fff;
			padding: 0;
		}
		.cv-card {
			max-width: 100%;
			box-shadow: none;
			padding: 0;
			transition: none;
		}
		.cv-toolbar {
			display: none !important;
		}
		:global(html) {
			font-size: 9.8pt;
		}
		:global(body) {
			background: #fff !important;
			-webkit-print-color-adjust: exact;
			print-color-adjust: exact;
		}
		.cv-body :global(h2) {
			margin-top: 14pt;
			break-after: avoid;
		}
		.cv-body :global(h3) {
			break-after: avoid;
		}
		.cv-body :global(li),
		.cv-body :global(h3 + p) {
			break-inside: avoid;
		}
		.cv-body :global(li:has(> code) > code),
		.cv-body :global(p:has(> strong:first-child):has(> code) > code) {
			border: 1px solid var(--cv-border);
		}
		.cv-footer {
			margin-top: 14pt;
			padding-top: 8pt;
		}
	}
</style>
