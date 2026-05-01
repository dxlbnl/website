<script lang="ts">
	import { resolve } from '$app/paths';
	import SectionH from '$lib/ui/SectionH.svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import ProductCard from '$lib/ui/ProductCard.svelte';
	import Led from '$lib/ui/Led.svelte';
	import type { ProductFrontmatter } from '$lib/types';
	import SEO from '$lib/ui/SEO.svelte';
	import type { Region } from '$lib/utils/location';

	type Props = { data: { products: ProductFrontmatter[]; region: Region } };
	let { data }: Props = $props();
	const production = $derived(data.products.filter((p) => p.status !== 'sold-out'));
	const archive = $derived(data.products.filter((p) => p.status === 'sold-out'));
</script>

<SEO
	title="Catalogue"
	description="Eurorack modules hand-built in Delft. Small batches, studio-grade quality."
/>

<div class="wrap">
	<section class="hero">
		<div class="eyebrow">// CATALOGUE · HARDWARE · FOR SALE</div>
		<h1>Catalogue.</h1>
		<p class="sub">
			Professional-grade Eurorack modules and studio tools. Engineered for stability and
			performance. Built in Delft, shipped worldwide. For custom engineering or prototype
			development, use the link below.
		</p>
		<div class="meta">
			<span><b>{data.products.length}</b> MODULES LIVE</span>
			<span><b>BATCH</b> 2026-Q2</span>
			<span><b>SHIPS FROM</b> DELFT, NL</span>
		</div>
	</section>

	{#if production.length > 0}
		<SectionH num="// 0x01" title="In development">
			<Led tone="amber" blink />
			<span>ACTIVE PROTOTYPING</span>
		</SectionH>

		<div class="grid">
			{#each production as product (product.id)}
				<ProductCard {product} region={data.region} />
			{/each}
		</div>
	{/if}

	{#if archive.length > 0}
		<SectionH
			num={production.length ? '// 0x02' : '// 0x01'}
			title="Archive"
			sub="SOLD OUT / DISCONTINUED"
		/>

		<div class="grid">
			{#each archive as product (product.id)}
				<ProductCard {product} region={data.region} />
			{/each}
		</div>
	{/if}

	<div class="hire">
		<div class="hire-label">// ENGINEERING & PROTOTYPING</div>
		<h3>Custom hardware and software development.</h3>
		<p>
			I take on a limited number of specialized engineering projects each year. If you have a
			concept that requires PCB design, embedded firmware development, or a functional prototype,
			get in touch to discuss the technical scope and timeline.
		</p>
		<a href={resolve('/contact/')} class="hire-link">GET IN TOUCH →</a>
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
	.hero {
		padding: 32px 0 40px;
		border-bottom: 1px solid var(--rule);
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
		font-size: clamp(48px, 8vw, 112px);
		line-height: 0.92;
		letter-spacing: -0.04em;
		margin: 0;
	}
	.sub {
		margin-top: 20px;
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		max-width: 62ch;
	}
	.meta {
		margin-top: 32px;
		display: flex;
		gap: 32px;
		flex-wrap: wrap;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.meta b {
		color: var(--ink);
		font-weight: 500;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		margin-top: 24px;

		@container (max-width: 900px) {
			grid-template-columns: 1fr 1fr;
		}
		@container (max-width: 720px) {
			grid-template-columns: 1fr;
		}
	}
	.hire {
		margin-top: 56px;
		border: 1px solid var(--rule);
		padding: 28px;
		background: var(--bg-rail);
	}
	.hire-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-bottom: 8px;
	}
	.hire h3 {
		font-family: var(--sans);
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.01em;
		margin: 0;
	}
	.hire p {
		color: var(--ink-dim);
		max-width: 62ch;
		margin-top: 10px;
		margin-bottom: 0;
		line-height: 1.6;
	}
	.hire-link {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--amber);
		margin-top: 12px;
		display: inline-block;
	}
	.hire-link:hover {
		color: var(--ink);
	}
</style>
