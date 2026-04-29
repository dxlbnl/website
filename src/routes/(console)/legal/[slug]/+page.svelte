<script lang="ts">
	import SEO from '$lib/ui/SEO.svelte';
	import type { Component } from 'svelte';
	import type { LegalFrontmatter } from '$lib/types';

	type Props = { data: { component: Component; metadata: LegalFrontmatter } };
	let { data }: Props = $props();
</script>

<SEO title={data.metadata.title} description="Legal information for Dexterlabs." />

<div class="wrap">
	<article>
		<div class="eyebrow">// LEGAL · {data.metadata.title.toUpperCase()}</div>
		<h1>{data.metadata.title}</h1>
		<div class="meta">Last updated: {data.metadata.lastUpdated}</div>
		<div class="body">
			<data.component />
		</div>
	</article>
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
	article {
		max-width: 68ch;
		margin: 0 auto;
		padding: 48px 0 40px;
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 16px;
		text-transform: uppercase;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(36px, 5vw, 56px);
		letter-spacing: -0.02em;
		line-height: 1.05;
		margin: 0 0 12px;
	}
	.meta {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-bottom: 0;
	}
	.body {
		padding-top: 32px;
		font-size: 17px;
		line-height: 1.65;

		:global {
			h2 {
				font-weight: 500;
				font-size: 22px;
				letter-spacing: -0.01em;
				margin: 48px 0 8px;
				color: var(--ink);
			}
			h3 {
				font-weight: 500;
				font-size: 17px;
				letter-spacing: -0.01em;
				margin: 32px 0 6px;
				color: var(--ink);
			}
			p {
				margin-bottom: 20px;
				color: var(--ink);
			}
			a {
				border-bottom: 1px solid var(--rule-strong);
				transition: border-color 0.15s;
				&:hover {
					border-color: var(--amber);
				}
			}
			strong {
				font-weight: 500;
				color: var(--ink);
			}
			blockquote {
				margin: 28px 0;
				padding: 4px 0 4px 16px;
				border-left: 2px solid var(--amber);
				color: var(--ink-dim);
				p {
					margin-bottom: 0;
				}
			}
			ul,
			ol {
				padding-left: 20px;
				margin-bottom: 20px;
				color: var(--ink);
			}
			li {
				margin-bottom: 6px;
				line-height: 1.65;
			}
			ul li::marker {
				color: var(--amber);
			}
			ol li::marker {
				font-family: var(--mono);
				font-size: 13px;
				color: var(--ink-faint);
			}
			hr {
				border: none;
				border-top: 1px solid var(--rule);
				margin: 48px 0;
			}
			table {
				width: 100%;
				border-collapse: collapse;
				font-family: var(--mono);
				font-size: var(--t-mono);
				margin: 24px 0;
			}
			th {
				text-align: left;
				padding: 8px 0;
				border-bottom: 1px solid var(--rule-strong);
				color: var(--ink-faint);
				letter-spacing: 0.1em;
				text-transform: uppercase;
				font-weight: 500;
			}
			td {
				padding: 8px 0;
				border-bottom: 1px dashed var(--rule);
				color: var(--ink-dim);
			}
			td:last-child {
				color: var(--ink);
			}
		}
	}
</style>
