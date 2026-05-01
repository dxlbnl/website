<script lang="ts">
	import { resolve } from '$app/paths';
	import Led from '$lib/ui/Led.svelte';
	import SectionH from '$lib/ui/SectionH.svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import ProductCard from '$lib/ui/ProductCard.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import { fmtDate } from '$lib/utils/fmt';
	import type { PageData } from './$types';

	type Props = { data: PageData };
	let { data }: Props = $props();

	function hexIdx(n: number) {
		return '0x' + n.toString(16).padStart(2, '0').toUpperCase();
	}
</script>

<SEO />

<div class="wrap">
	<section class="hero">
		<div class="eyebrow">// DEXTERLABS · WORKBENCH · 2026</div>
		<h1>Dexter.<br /><em>Things built</em><br />in the lab.</h1>
		<p class="sub">
			Software engineer by day; hardware builder by night. Documenting Eurorack designs, web
			experiments, and bench notes. The fails stay in the log, the wins ship to your rack.
		</p>

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
	</section>

	{#if data.products.length > 0}
		<SectionH num="// 0x01" title="Catalogue" sub="PRODUCTION-READY HARDWARE" />
		<div class="cat-grid">
			{#each data.products as product (product.id)}
				<ProductCard {product} region={data.region} />
			{/each}
		</div>
		<div class="cat-foot">
			<a href={resolve('/catalogue/')} class="all-link">VIEW ALL HARDWARE →</a>
			<span class="faint">SHIPPED BY DEXTERLABS · DELFT, NL</span>
		</div>
	{/if}

	{#if data.notes.length > 0}
		<SectionH num="// 0x02" title="Notes" sub="ENGINEERING NOTES & EXPERIMENTS" />
		<div class="note-grid">
			{#each data.notes as note, i (note.slug)}
				<a href={resolve(`/notes/${note.slug}/`)} class="note-card">
					<div class="card-head">
						<span class="card-idx">{hexIdx(note.idx)}</span>
						<span class="card-kind">{note.kind ?? 'LOG'}</span>
					</div>
					<h3 class="card-title">{note.title}</h3>
					{#if note.lede}<p class="card-desc">{note.lede}</p>{/if}
					<div class="card-foot">
						<span>{fmtDate(note.date)}</span>
						<span class="card-read">READ →</span>
					</div>
				</a>
			{/each}
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

	/* Hero */
	.hero {
		padding: 80px 0 56px;

		@media (max-width: 720px) {
			padding: 20px 0 56px;
		}
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 24px;
	}
	.hero h1 {
		font-weight: 500;
		font-size: clamp(48px, 9vw, 120px);
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0;
	}
	.hero h1 em {
		font-style: normal;
		color: var(--ink-faint);
	}
	.sub {
		margin-top: 24px;
		max-width: 62ch;
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
	}

	/* Status - now a link inside the hero */
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
		font-size: 17px;
		line-height: 1.5;
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}

	/* Notes grid */
	.note-grid {
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
	.note-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		border: 1px solid var(--rule);
		background: var(--bg-rail);
		color: inherit;
		transition: border-color 0.15s;
	}
	.note-card:hover {
		border-color: var(--amber);
	}
	.card-head {
		display: flex;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.card-idx {
		color: var(--ink-faint);
	}
	.card-kind {
		color: var(--cyan);
	}
	.card-title {
		font-weight: 500;
		font-size: var(--t-lede);
		letter-spacing: -0.01em;
		margin: 4px 0 0;
	}
	.card-desc {
		font-size: 14px;
		color: var(--ink-dim);
		line-height: 1.5;
		flex: 1;
	}
	.card-foot {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		color: var(--ink-faint);
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px dashed var(--rule);
	}
	.card-read {
		color: var(--amber);
	}

	/* Catalogue */
	.cat-grid {
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
	.all-link {
		color: var(--amber);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.all-link:hover {
		color: var(--ink);
	}
	.faint {
		color: var(--ink-faint);
		text-transform: uppercase;
	}
</style>
