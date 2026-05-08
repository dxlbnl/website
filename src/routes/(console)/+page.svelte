<script lang="ts">
	import { resolve } from '$app/paths';
	import { fmtDate } from '$lib/utils/fmt';
	import Led from '$lib/ui/Led.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import SectionH from '$lib/ui/SectionH.svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import ProductCard from '$lib/ui/ProductCard.svelte';
	import NoteCard from '$lib/ui/NoteCard.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import type { PageData } from './$types';

	type Props = { data: PageData };
	let { data }: Props = $props();
</script>

<SEO />

<div class="wrap">
	<PageHero
		eyebrow="// DEXTERLABS · WORKBENCH · 2026"
		sub="Software engineer by day; hardware builder by night. Documenting Eurorack designs, web experiments, and bench notes. The fails stay in the log, the wins ship to your rack."
		border={false}
	>
		{#snippet headingContent()}
			Dexter.<br /><em>Things built</em><br />in the lab.
		{/snippet}
		{#if data.latestFeed}
			<a href={resolve('/feed/')} class="status">
				<div class="status-head">
					<span>// LATEST ENTRY</span>
					<span>{fmtDate(data.latestFeed.date)} →</span>
				</div>
				<div class="status-line">
					<Led tone="amber" blink />
					<span>{data.latestFeed.body}</span>
				</div>
			</a>
		{/if}
	</PageHero>

	{#if data.products.length > 0}
		<SectionH num="// 0x01" title="Catalogue" sub="PRODUCTION-READY HARDWARE" />
		<div class="card-grid">
			{#each data.products as product (product.id)}
				<ProductCard {product} region={data.region} />
			{/each}
		</div>
		<div class="cat-foot">
			<a href={resolve('/catalogue/')} class="btn-cta">VIEW ALL HARDWARE →</a>
			<span class="faint">SHIPPED BY DEXTERLABS · DELFT, NL</span>
		</div>
	{/if}

	{#if data.notes.length > 0}
		<SectionH num="// 0x02" title="Notes" sub="ENGINEERING NOTES & EXPERIMENTS" />
		<div class="card-grid max-2-rows">
			{#each data.notes as note (note.slug)}
				<NoteCard
					slug={note.slug}
					idx={note.idx}
					title={note.title}
					date={note.date}
					kind={note.kind}
					lede={note.lede}
				/>
			{/each}
		</div>
		<div class="cat-foot">
			<a href={resolve('/notes/')} class="btn-cta">VIEW ALL NOTES →</a>
			<span class="faint">ENGINEERING NOTES & EXPERIMENTS</span>
		</div>
	{/if}

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

	@media (max-width: 720px) {
		.wrap :global(.hero) {
			padding: 20px 0 56px;
		}
	}

	/* Status - link inside the hero */
	.status {
		display: block;
		margin-top: 32px;
		padding: 16px 20px;
		border: 1px solid var(--rule);
		background: var(--bg-rail);
		max-width: 62ch;
		color: inherit;
		transition: border-color 0.15s;
	}
	.status:hover {
		border-color: var(--amber);
	}
	.status-head {
		display: flex;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.status-line {
		margin-top: 10px;
		font-size: var(--t-body);
		line-height: 1.5;
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	/* Catalogue */
	.cat-foot {
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		padding-top: 16px;
		border-top: 1px solid var(--rule);
	}
	.faint {
		color: var(--ink-faint);
		text-transform: uppercase;
	}
</style>
