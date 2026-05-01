<script lang="ts">
	import type { ProductFrontmatter } from '$lib/types';
	import { resolveProductImage, vercelSrcset } from '$lib/utils/image';
	import { type Region } from '$lib/utils/location';
	import { useProduct } from '$lib/utils/product.svelte';
	import Led from './Led.svelte';

	type Props = { product: ProductFrontmatter; region: Region };
	let { product, region = null }: Props = $props();

	const pd = useProduct(
		() => product,
		() => region
	);
</script>

<a href="/catalogue/{product.id}/" class="card">
	<div class="img">
		{#if product.image}
			<img
					src={resolveProductImage(product.image, product.id)}
					srcset={vercelSrcset(resolveProductImage(product.image, product.id), [256, 384, 512, 768, 960])}
					sizes="(max-width: 820px) calc(100vw - 32px), (max-width: 1000px) calc(50vw - 40px), calc(33.33vw - 32px)"
					alt={product.name}
					loading="lazy"
				/>
		{:else}
			{product.id.toUpperCase()} · PRODUCT SHOT
		{/if}
	</div>
	<div class="body">
		<div class="sku">{product.id.toUpperCase()}</div>
		<h3 class="title">{product.name}</h3>
		<p class="desc">{product.description}</p>
		<div class="meta">
			<span class="price">
				{pd.displayPrice ?? '—'}
				{#if pd.taxLabel}<span class="tax-hint">{pd.taxLabel}</span>{/if}
			</span>

			<span class="stock {pd.stock.cls}">
				<Led tone={pd.stock.led} />
				{pd.stock.label}{#if pd.stock.ship}
					· {pd.stock.ship}{/if}
			</span>
		</div>
	</div>
	<div class="cta">
		<span>{pd.cta}</span>
		<span>→</span>
	</div>
</a>

<style>
	.card {
		border: 1px solid var(--rule);
		background: var(--bg-rail);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.img {
		aspect-ratio: 1;
		background: repeating-linear-gradient(
			135deg,
			var(--bg-sunken) 0 10px,
			var(--bg-elev) 10px 20px
		);
		border-bottom: 1px solid var(--rule);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.12em;
		overflow: hidden;
	}
	.img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.body {
		padding: 12px 14px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}
	.sku {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.12em;
	}
	.title {
		font-weight: 500;
		font-size: 18px;
		letter-spacing: -0.01em;
		line-height: 1.2;
	}
	.desc {
		font-size: 12px;
		color: var(--ink-dim);
		line-height: 1.4;
	}
	.meta {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-top: auto;
		padding-top: 8px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.price {
		font-size: 15px;
		color: var(--amber);
		display: flex;
		align-items: baseline;
		gap: 5px;
	}
	.tax-hint {
		font-size: 9px;
		color: var(--ink-faint);
		letter-spacing: 0.06em;
		text-transform: lowercase;
	}
	.stock {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);

		&.ok {
			color: var(--ok);
		}

		&.low {
			color: var(--amber);
		}

		&.out {
			color: var(--ink-faint);
		}
	}

	.cta {
		border-top: 1px solid var(--rule);
		padding: 10px 14px;
		display: flex;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-dim);
		transition:
			background 0.15s,
			color 0.15s;
	}
	.card:hover .cta {
		background: var(--amber);
		color: var(--bg);
	}
</style>
