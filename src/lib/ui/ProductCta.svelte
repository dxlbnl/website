<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';
	import type { Region } from '$lib/utils/location';
	import { useProduct } from '$lib/utils/product.svelte';
	import { resolve } from '$app/paths';

	type Props = { product: ProductFrontmatter; region: Region };
	let { product, region }: Props = $props();

	const pd = useProduct(
		() => product,
		() => region
	);
</script>

<a href={resolve(`/catalogue/${product.id}/`)} class="product-cta">
	<div class="cta-body">
		<span class="cta-eyebrow">// THE HARDWARE</span>
		<span class="cta-name">{product.name}</span>
		<span class="cta-desc">{product.description}</span>
	</div>
	<span class="cta-link">{pd.cta} &rarr;</span>
</a>

<style>
	.product-cta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		border: 1px solid var(--amber);
		padding: 20px 24px;
		transition: background 0.15s;
	}
	.product-cta:hover {
		background: color-mix(in srgb, var(--amber) 6%, transparent);
	}
	.cta-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.cta-eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
	}
	.cta-name {
		font-weight: 500;
		font-size: var(--t-lede);
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.cta-desc {
		font-size: var(--t-mono);
		color: var(--ink-dim);
		line-height: 1.4;
	}
	.cta-link {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--amber);
		white-space: nowrap;
		flex-shrink: 0;
	}
</style>
