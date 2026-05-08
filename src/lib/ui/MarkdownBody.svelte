<script lang="ts">
	import type { Component } from 'svelte';

	type Props = { component: Component };
	let { component: Content }: Props = $props();
</script>

<div class="body">
	<Content />
</div>

<style>
	.body {
		padding-top: 32px;
		font-size: var(--t-body);
		line-height: 1.65;

		:global {
			h2 {
				font-weight: 500;
				font-size: var(--t-h3);
				letter-spacing: -0.01em;
				margin: 48px 0 8px;
				color: var(--ink);
			}
			h3 {
				font-weight: 500;
				font-size: var(--t-lede);
				letter-spacing: -0.01em;
				margin: 32px 0 6px;
				color: var(--ink);
			}
			p {
				margin-bottom: 20px;
				color: var(--ink);
			}
			a:not([class]) {
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
			em {
				color: var(--ink-dim);
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
			code {
				font-family: var(--mono);
				font-size: var(--t-mono);
				background: var(--bg-elev);
				padding: 1px 5px;
				border: 1px solid var(--rule);
				border-radius: 2px;
				color: var(--cyan);
			}
			pre {
				border: 1px solid var(--rule);
				border-radius: 2px;
				padding: 16px 20px;
				overflow-x: auto;
				white-space: pre;
				margin: 24px 0;
				line-height: 1.6;
				code {
					background: none;
					border: none;
					padding: 0;
					font-size: var(--t-mono);
					color: inherit;
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
				font-size: var(--t-mono);
				color: var(--ink-faint);
			}
			hr {
				border: none;
				border-top: 1px solid var(--rule);
				margin: 48px 0;
			}
			img {
				width: 100%;
				height: auto;
				display: block;
				border: 1px solid var(--rule);
				margin: 28px 0;
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
			td:first-child {
				width: 40%;
			}
			td:last-child {
				color: var(--ink);
			}
		}
	}
</style>
