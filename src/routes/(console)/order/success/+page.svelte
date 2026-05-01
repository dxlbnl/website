<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import Led from '$lib/ui/Led.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	let { data }: { data: PageData } = $props();
	const isPreorder = $derived(data.product?.status === 'coming-soon');
	const productName = $derived(data.product?.name ?? 'your module');

	const headline = $derived(isPreorder ? 'Pre-order received.' : 'Order received.');
	const label = $derived(isPreorder ? 'PRE-ORDER RECEIVED' : 'ORDER CONFIRMED');
</script>

<SEO
	title={isPreorder ? 'Pre-order Confirmed' : 'Order Confirmed'}
	description={isPreorder
		? "Thanks for the support. We'll be in touch as development progresses."
		: "Your order is in. We'll be in touch when your batch ships."}
/>

<div class="wrap">
	<div class="box">
		<div class="label"><Led tone="ok" /> {label}</div>
		<h1>{headline}</h1>
		<p>
			{#if isPreorder}
				Thanks for the support. I'm working hard to get {productName} ready for you. I'll make sure to
				keep you updated on the progress.
			{:else}
				Thanks for the order. I'll be shipping {productName} soon! You'll get an email with tracking as
				soon as it's on its way.
			{/if}
		</p>
		<a href={resolve('/catalogue/')} class="back">← RETURN TO CATALOGUE</a>
	</div>
	<Signature />
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 80px 32px;

		@media (max-width: 720px) {
			padding: 40px 16px;
		}
	}
	.box {
		max-width: 48ch;
	}
	.label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ok);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 12px;
	}
	h1 {
		font-weight: 500;
		font-size: var(--t-title);
		letter-spacing: -0.02em;
		margin: 0 0 16px;
		line-height: 1;
	}
	p {
		font-size: var(--t-body);
		line-height: 1.6;
		color: var(--ink-dim);
		margin: 0 0 32px;
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
</style>
