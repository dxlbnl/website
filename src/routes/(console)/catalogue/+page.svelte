<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import ProductCard from '$lib/ui/ProductCard.svelte';
	import Led from '$lib/ui/Led.svelte';
	import type { ProductFrontmatter } from '$lib/types';
	import SEO from '$lib/ui/SEO.svelte';
	import type { Region } from '$lib/utils/location';

	type Props = { data: { products: ProductFrontmatter[]; region: Region } };
	let { data }: Props = $props();
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
			Eurorack modules, hand-built in Delft. Small batches. Solder joints checked twice. Shipped by
			<em>Dexterlabs</em>. Custom or prototype work?
			<a href="/contact" class="contact-link">get in touch</a>.
		</p>
		<div class="meta">
			<span><b>{data.products.length}</b> MODULES LIVE</span>
			<span><b>BATCH</b> 2026-Q2</span>
			<span><b>SHIPS FROM</b> DELFT, NL</span>
		</div>
	</section>

	<header class="section-h">
		<span class="s-num">// 0x01</span>
		<span class="s-title">Currently in production</span>
		<span class="s-right"><Led tone="amber" blink />ACCEPTING ORDERS</span>
	</header>

	<div class="grid">
		{#each data.products as product}
			<ProductCard {product} region={data.region} />
		{/each}
	</div>

	<div class="hire">
		<div class="hire-label">// PROTOTYPE-FOR-HIRE</div>
		<h3>Got an idea for a module? I sometimes build prototypes.</h3>
		<p>
			If you have a concept for a Eurorack module and want a working PCB to test it on, I can
			occasionally take on a small prototyping job on the side. Drop me a line and we'll talk scope.
		</p>
		<a href="/contact" class="hire-link">GET IN TOUCH →</a>
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
	.contact-link {
		color: var(--amber);
		border-bottom: 1px solid var(--amber);
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
	.section-h {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 40px 0 12px;
		border-bottom: 1px solid var(--rule);
	}
	.s-num {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		letter-spacing: 0.12em;
	}
	.s-title {
		font-weight: 500;
		font-size: var(--t-h3);
		letter-spacing: -0.01em;
	}
	.s-right {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.08em;
		text-transform: uppercase;
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
