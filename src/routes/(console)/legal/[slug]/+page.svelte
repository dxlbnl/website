<script lang="ts">
	import SEO from '$lib/ui/SEO.svelte';
	import MarkdownBody from '$lib/ui/MarkdownBody.svelte';
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
		<MarkdownBody component={data.component} />
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
	h1 {
		font-weight: 500;
		font-size: var(--t-title);
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
</style>
