<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import Led from '$lib/ui/Led.svelte';
	import type { Component } from 'svelte';
	import type { ProductFrontmatter } from '$lib/types';
	import SubscribeForm from '$lib/ui/SubscribeForm.svelte';
	import { resolveProductImage } from '$lib/utils/image';
	import SEO from '$lib/ui/SEO.svelte';

	type Props = { data: { component: Component; product: ProductFrontmatter; isEU: boolean } };
	let { data }: Props = $props();

	const stockMap: Record<
		string,
		{ label: string; cls: string; led: 'ok' | 'amber' | 'off'; ship?: string }
	> = {
		available: { label: 'IN STOCK', cls: 'ok', led: 'ok', ship: 'SHIPS IN 3–5 DAYS' },
		'sold-out': { label: 'SOLD OUT', cls: 'out', led: 'off' },
		'coming-soon': { label: 'PREORDER', cls: 'low', led: 'amber' }
	};
	const stock = $derived(
		stockMap[data.product.status] ?? { label: data.product.status, cls: '', led: 'off' }
	);
	const cta = $derived(data.product.status === 'coming-soon' ? 'PREORDER' : 'ADD TO RACK');

	let buying = $state(false);
	let checkoutError = $state(false);
	let activeIndex = $state(0);

	const galleryImages = $derived(
		data.product.images?.length
			? data.product.images.map(img => resolveProductImage(img, data.product.id))
			: data.product.image
				? [resolveProductImage(data.product.image, data.product.id)]
				: []
	);

	async function startCheckout() {
		if (!data.product.stripePriceId) return;
		buying = true;
		checkoutError = false;
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ priceId: data.product.stripePriceId, productId: data.product.id })
			});
			if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
			const { url } = await res.json();
			window.location.href = url;
		} catch (err) {
			console.error(err);
			checkoutError = true;
			buying = false;
		}
	}
</script>

<SEO
	title={data.product.name}
	description={data.product.description}
	image={galleryImages[0]}
	type="product"
/>

<div class="wrap">
	<div class="back-row">
		<a href="/catalogue" class="back">← RETURN TO CATALOGUE</a>
	</div>

	<div class="grid" class:no-image={!galleryImages.length}>
		<div class="img-col">
			{#if galleryImages.length}
				<div class="hero-img">
					<img src={galleryImages[activeIndex]} alt={data.product.name} />
				</div>
				{#if galleryImages.length > 1}
					<div class="thumbs">
						{#each galleryImages as src, i}
							<button
								class="thumb"
								class:active={i === activeIndex}
								onclick={() => (activeIndex = i)}
							>
								<img {src} alt="" />
							</button>
						{/each}
					</div>
				{/if}
			{/if}
			<div class="content">
				<data.component />
			</div>
		</div>

		<div class="side">
			<div class="side-top">
				<div class="sub">{data.product.id.toUpperCase()} · {data.product.category.toUpperCase()}</div>
				<h1>{data.product.name}</h1>
				{#if data.product.tags?.length}
					<div class="tags">
						{#each data.product.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
				<p class="lede">{data.product.description}</p>
			</div>

			<div class="side-bottom">
				{#if data.product.specs}
					<div class="specs-label">// QUICK SPECS</div>
					<table class="specs">
						<tbody>
							{#each Object.entries(data.product.specs) as [key, val]}
								<tr><td>{key}</td><td>{val}</td></tr>
							{/each}
						</tbody>
					</table>
				{/if}

				<div
					class="pricebox"
					class:notify={(data.product.status === 'available' ||
						data.product.status === 'coming-soon') &&
						!data.product.stripePriceId &&
						!data.product.tindieUrl}
				>
					<div class="price-col">
						{#if data.product.price}
							<span class="price">€{data.isEU ? Math.round(data.product.price * 1.21) : data.product.price}</span>
							<span class="price-tax">{data.isEU ? 'incl. BTW' : 'excl. VAT'}</span>
						{:else}
							<span class="price">TBD</span>
						{/if}
						<span class="stock-info {stock.cls}">
							<Led tone={stock.led} />
							{stock.label}{#if stock.ship}
								· {stock.ship}{/if}
						</span>
					</div>
					{#if data.product.status === 'available' || data.product.status === 'coming-soon'}
						{#if data.product.stripePriceId}
							<button class="buy" onclick={startCheckout} disabled={buying}>
								{buying ? 'LOADING…' : `${cta} →`}
							</button>
							{#if checkoutError}
								<span class="checkout-err">Something went wrong. Please try again.</span>
							{/if}
						{:else if data.product.tindieUrl}
							<a href={data.product.tindieUrl} target="_blank" rel="noopener" class="buy">
								{cta} →
							</a>
						{:else}
							<div class="notify-form">
								<SubscribeForm label="Want to be in the loop?" buttonText="NOTIFY ME →" />
							</div>
						{/if}
					{:else}
						<span class="sold-out-label">SOLD OUT</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<Signature />
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
		container-type: inline-size;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
	.back-row {
		padding: 32px 0 0;
	}
	.back {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.back:hover {
		color: var(--amber);
	}
	.grid {
		display: flex;
		align-items: flex-start;
		gap: 48px;
		padding: 24px 0 40px;

		@container (max-width: 900px) {
			flex-direction: column;
			align-items: stretch;
			gap: 24px;
		}
	}
	.grid.no-image {
		max-width: 68ch;
	}
	.img-col {
		flex: 1.1;
		display: flex;
		flex-direction: column;

		@container (max-width: 900px) {
			display: contents;
		}
	}
	.side {
		flex: 1;

		@container (max-width: 900px) {
			display: contents;
		}
	}
	.hero-img,
	.thumbs {
		@container (max-width: 900px) {
			order: 2;
		}
	}
	.side-top {
		@container (max-width: 900px) {
			order: 1;
		}
	}
	.side-bottom {
		@container (max-width: 900px) {
			order: 3;
		}
	}
	.content {
		@container (max-width: 900px) {
			order: 4;
		}
	}
	.hero-img {
		aspect-ratio: 3 / 2;
		border: 1px solid var(--rule);
		overflow: hidden;
	}
	.hero-img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.thumbs {
		display: flex;
		gap: 6px;
		margin-top: 6px;
		overflow-x: auto;
	}
	.thumb {
		flex-shrink: 0;
		width: 72px;
		height: 72px;
		border: 1px solid var(--rule);
		overflow: hidden;
		padding: 0;
		cursor: pointer;
		transition: border-color 0.1s;
	}
	.thumb.active {
		border-color: var(--amber);
	}
	.thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.sub {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(36px, 5vw, 56px);
		letter-spacing: -0.02em;
		margin: 8px 0 6px;
		line-height: 1;
	}
	.tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		margin-top: 12px;
	}
	.tag {
		display: inline-block;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-dim);
		padding: 2px 6px;
		border: 1px solid var(--rule);
	}
	.lede {
		font-size: 17px;
		line-height: 1.55;
		color: var(--ink-dim);
		margin: 24px 0;
		max-width: 48ch;
	}
	.specs-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
		margin-bottom: 4px;
	}
	.specs {
		width: 100%;
		border-collapse: collapse;
		margin-top: 4px;
		font-family: var(--mono);
		font-size: var(--t-mono);
	}
	.specs td {
		padding: 8px 0;
		border-bottom: 1px dashed var(--rule);
	}
	.specs td:first-child {
		color: var(--ink-dim);
		width: 40%;
	}
	.specs td:last-child {
		color: var(--ink);
		text-align: right;
	}
	.pricebox {
		margin-top: 24px;
		padding: 20px;
		border: 1px solid var(--rule);
		background: var(--bg-rail);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
	}
	.pricebox.notify {
		flex-direction: column;
		align-items: flex-start;
	}
	.price-col {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.price {
		font-family: var(--mono);
		font-size: 28px;
		color: var(--amber);
		letter-spacing: 0.02em;
	}
	.price-tax {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-top: -2px;
	}
	.stock-info {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.stock-info.ok {
		color: var(--ok);
	}
	.stock-info.low {
		color: var(--amber);
	}
	.buy {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.1em;
		padding: 10px 16px;
		background: var(--amber);
		color: var(--bg);
		text-transform: uppercase;
		transition: background 0.15s;
		white-space: nowrap;
	}
	.buy:hover {
		background: var(--ink);
	}
	.buy:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.checkout-err {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--danger, #e53);
		letter-spacing: 0.06em;
	}
	.sold-out-label {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.notify-form {
		width: 100%;
	}
	.content {
		max-width: 68ch;
		padding: 40px 0;
		font-size: 17px;
		line-height: 1.65;
		border-top: 1px solid var(--rule);

		:global {
			h2 {
				font-weight: 500;
				font-size: 22px;
				margin: 32px 0 8px;
				letter-spacing: -0.01em;
			}
			p {
				margin-bottom: 16px;
				color: var(--ink-dim);
			}
			ul,
			ol {
				padding-left: 20px;
				margin-bottom: 16px;
				color: var(--ink-dim);
			}
			li {
				margin-bottom: 4px;
			}
			ul li::marker {
				color: var(--amber);
			}
			strong {
				color: var(--ink);
				font-weight: 500;
			}
			em {
				color: var(--ink-dim);
			}
			code {
				font-family: var(--mono);
				font-size: 13px;
				background: var(--bg-elev);
				padding: 1px 5px;
				border: 1px solid var(--rule);
				border-radius: 2px;
			}
			table {
				width: 100%;
				border-collapse: collapse;
				font-family: var(--mono);
				font-size: var(--t-mono);
				margin-bottom: 24px;
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
				text-align: left;
			}
			td:last-child {
				color: var(--ink);
			}
			hr {
				border: none;
				border-top: 1px solid var(--rule);
				margin: 40px 0;
			}
		}
	}
</style>
