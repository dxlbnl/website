<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		eyebrow: string;
		title?: string;
		sub?: string;
		border?: boolean;
		headingContent?: Snippet;
		children?: Snippet;
	};
	let { eyebrow, title, sub, border = true, headingContent, children }: Props = $props();
</script>

<section class="hero" class:bordered={border}>
	<div class="eyebrow">{eyebrow}</div>
	<h1>
		{#if headingContent}{@render headingContent()}{:else}{title ?? ''}{/if}
	</h1>
	{#if sub}<p class="sub">{sub}</p>{/if}
	{#if children}{@render children()}{/if}
</section>

<style>
	.hero {
		padding: 48px 0 40px;
	}
	.hero.bordered {
		border-bottom: 1px solid var(--rule);
	}
	h1 {
		font-weight: 500;
		font-size: var(--t-hero);
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0;
	}
	h1 :global(em) {
		font-style: normal;
		color: var(--ink-faint);
	}
	.sub {
		margin-top: 20px;
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		max-width: 62ch;
	}
</style>
