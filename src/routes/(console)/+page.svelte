<script lang="ts">
	import { resolve } from '$app/paths';
	import PageHero from '$lib/ui/PageHero.svelte';
	import SectionH from '$lib/ui/SectionH.svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import ProductCard from '$lib/ui/ProductCard.svelte';
	import ProjectCard from '$lib/ui/ProjectCard.svelte';
	import NoteCard from '$lib/ui/NoteCard.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import { vercelImg, vercelSrcset } from '$lib/utils/image';
	import type { PageData } from './$types';

	type Props = { data: PageData };
	let { data }: Props = $props();
</script>

<SEO
	title="Dexterlabs"
	description="A one-person engineering lab. Eurorack modules, software experiments, and bench notes from Delft."
/>

<div class="wrap">
	<PageHero
		eyebrow="// DEXTERLABS · WORKBENCH · 2026"
		sub="Software engineer by day; hardware builder by night. Documenting Eurorack designs, web experiments, and bench notes. The fails stay in the log, the wins ship to your rack."
		border={false}
	>
		{#snippet headingContent()}
			<img
				src={vercelImg('dexter.png', 400)}
				srcset={vercelSrcset('dexter.png', [160, 280, 400, 560])}
				sizes="(max-width: 480px) 120px, 280px"
				alt=""
				aria-hidden="true"
				class="hero-portrait"
			/>
			<span>Dexter.<br /><em>Things built</em><br />in the lab.</span>
		{/snippet}
	</PageHero>

	{#if data.products.length > 0}
		<SectionH num="// 0x01" title="Catalogue" sub="PRODUCTION-READY HARDWARE" />
		<div class="card-grid">
			{#each data.products as product (product.id)}
				<ProductCard {product} region={data.region} />
			{/each}
		</div>
		<div class="cat-foot">
			<a href={resolve('/catalogue/')} class="btn-ghost">VIEW ALL HARDWARE →</a>
			<span class="faint">SHIPPED BY DEXTERLABS · DELFT, NL</span>
		</div>
	{/if}

	{#if data.projects.length > 0}
		<SectionH num="// 0x02" title="Projects" sub="SOFTWARE & OPEN SOURCE" />
		<div class="card-grid">
			{#each data.projects as project (project.slug)}
				<ProjectCard {project} />
			{/each}
		</div>
		<div class="cat-foot">
			<a href={resolve('/projects/')} class="btn-ghost">VIEW ALL PROJECTS →</a>
		</div>
	{/if}

	{#if data.notes.length > 0}
		<SectionH num="// 0x03" title="Notes" sub="ENGINEERING NOTES & EXPERIMENTS" />
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
			<a href={resolve('/notes/')} class="btn-ghost">VIEW ALL NOTES →</a>
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

	/* Hero portrait — in-flow, left of the heading text */
	.wrap :global(.hero h1) {
		display: flex;
		align-items: flex-start;
		gap: 0.25em;
	}
	.hero-portrait {
		height: 2.5em; /* spans all three heading lines */
		width: auto;
		flex-shrink: 0;
		object-fit: contain;
		object-position: left top;
		pointer-events: none;
		user-select: none;
		mix-blend-mode: screen;
		align-self: center;
	}
	:global([data-palette='paper']) .hero-portrait {
		mix-blend-mode: multiply;
	}

	@media (max-width: 720px) {
		.wrap :global(.hero) {
			padding: 20px 0 56px;
		}
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
