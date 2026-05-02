<script lang="ts">
	import Led from '$lib/ui/Led.svelte';
	import SubscribeForm from '$lib/ui/SubscribeForm.svelte';
	import type { ProductFrontmatter } from '$lib/types';
	import { type Region } from '$lib/utils/location';
	import { useProduct } from '$lib/utils/product.svelte';

	type Props = { product: ProductFrontmatter; region: Region };
	let { product, region }: Props = $props();

	const pd = useProduct(
		() => product,
		() => region
	);

	let buying = $state(false);
	let checkoutError = $state(false);

	const notify = $derived(
		(product.status === 'available' || product.status === 'coming-soon') &&
			!product.stripeProduct &&
			!product.tindieUrl
	);

	async function startCheckout() {
		if (!product.stripeProduct) return;
		buying = true;
		checkoutError = false;
		try {
			const res = await fetch('/api/checkout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ product: product.id })
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

<div class="pricebox" class:notify>
	<div class="price-col">
		<div class="price-row">
			<span class="price">{pd.displayPrice || 'TBD'}</span>
			{#if pd.displayPrice}
				<span class="price-tax">{pd.taxLabel}</span>
			{/if}
		</div>
		<span class="stock-info {pd.stock.cls}">
			<Led tone={pd.stock.led} />
			{pd.stock.label}{#if pd.stock.ship}
				· {pd.stock.ship}{/if}
		</span>
	</div>
	{#if product.status === 'available' || product.status === 'coming-soon'}
		{#if product.stripeProduct}
			<div class="checkout-col">
				<button class="btn-primary" onclick={startCheckout} disabled={buying}>
					{buying ? 'LOADING…' : `${pd.cta} →`}
				</button>
				{#if checkoutError}
					<span class="checkout-err">Something went wrong. Please try again.</span>
				{/if}
			</div>
		{:else if product.tindieUrl}
			<a href={product.tindieUrl} target="_blank" rel="external noopener" class="btn-primary">
				{pd.cta} →
			</a>
		{:else}
			<div class="notify-form">
				<SubscribeForm label="Want to be the first to know?" buttonText="NOTIFY ME →" />
			</div>
		{/if}
	{:else}
		<span class="sold-out-label">SOLD OUT</span>
	{/if}
</div>

<style>
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
	.price-row {
		display: flex;
		align-items: flex-end;
		gap: 8px;
	}
	.price {
		font-family: var(--mono);
		font-size: var(--t-h2);
		line-height: 1;
		color: var(--amber);
		letter-spacing: 0.02em;
	}
	.price-tax {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.06em;
		text-transform: uppercase;
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

		:global {
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
	}
	.checkout-col {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
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
</style>
