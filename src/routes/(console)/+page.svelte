<script lang="ts">
	import {
		Container,
		Stack,
		Grid,
		PageHero,
		SectionHead,
		SectionFoot,
		ProductCard,
		ProjectCard,
		NoteCard
	} from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import { fmtCents } from '$lib/utils/fmt';
	import { resolveProductImage, resolveProjectImage, vercelSrcset } from '$lib/utils/image';
	import { resolve } from '$app/paths';
	import type { ProductFrontmatter, ProjectFrontmatter } from '$lib/types';
	import type { PageData } from './$types';

	type Props = { data: PageData };
	let { data }: Props = $props();

	function priceFor(product: ProductFrontmatter): string {
		const cents = data.region === 'World' ? product.priceExcl : product.priceIncl;
		return fmtCents(cents);
	}

	function stockStatus(s: ProductFrontmatter['status']): 'in-stock' | 'coming-soon' | 'out-of-stock' {
		if (s === 'available') return 'in-stock';
		if (s === 'coming-soon') return 'coming-soon';
		return 'out-of-stock';
	}

	function productImage(product: ProductFrontmatter): string | undefined {
		const raw = product.image ?? product.images?.[0];
		return raw ? resolveProductImage(raw, product.id) : undefined;
	}

	function projectImage(project: ProjectFrontmatter): string | undefined {
		return project.image ? resolveProjectImage(project.image) : undefined;
	}

	function projectImageLight(project: ProjectFrontmatter): string | undefined {
		return project.imageLight ? resolveProjectImage(project.imageLight) : undefined;
	}
</script>

<SEO
	title="Dexterlabs"
	description="A one-person engineering lab. Eurorack modules, software experiments, and bench notes from Delft."
/>

<Container size="lg">
	<PageHero
		variant="hero"
		eyebrow="// DEXTERLABS · WORKBENCH · 2026"
		lede="Software engineer by day; hardware builder by night. Documenting Eurorack designs, web experiments, and bench notes. The fails stay in the log, the wins ship to your rack."
		border={false}
	>
		{#snippet heading()}
			<img
				src="/images/dexter-384.webp"
				srcset="/images/dexter-128.webp 128w, /images/dexter-256.webp 256w, /images/dexter-384.webp 384w, /images/dexter-512.webp 512w"
				sizes="(max-width: 480px) 120px, 280px"
				alt=""
				aria-hidden="true"
				class="hero-portrait"
			/>
			<span>Dexter.<br /><em>Things built</em><br />in the lab.</span>
		{/snippet}
	</PageHero>

	<Stack gap="lg">
		{#if data.products.length > 0}
			<SectionHead eyebrow="// 0x01" heading="Catalogue" sublabel="PRODUCTION-READY HARDWARE" />
			<Grid cols={3} gap="sm">
				{#each data.products as product (product.id)}
					{@const img = productImage(product)}
					<ProductCard
						sku={product.id}
						name={product.name}
						description={product.description}
						price={priceFor(product)}
						status={stockStatus(product.status)}
						href={resolve(`/catalogue/${product.id}/`)}
						image={img}
						imageSrcset={img ? vercelSrcset(img, [256, 384, 512, 768, 960]) : undefined}
					/>
				{/each}
			</Grid>
			<SectionFoot
				href={resolve('/catalogue/')}
				label="VIEW ALL HARDWARE →"
				meta="SHIPPED BY DEXTERLABS · DELFT, NL"
			/>
		{/if}

		{#if data.projects.length > 0}
			<SectionHead eyebrow="// 0x02" heading="Projects" sublabel="SOFTWARE & OPEN SOURCE" />
			<Grid cols={3} gap="sm">
				{#each data.projects as project (project.slug)}
					{@const img = projectImage(project)}
					{@const imgLight = projectImageLight(project)}
					<ProjectCard
						slug={project.slug}
						title={project.title}
						description={project.description}
						tags={project.tags}
						href={resolve(`/projects/${project.slug}/`)}
						image={img}
						imageSrcset={img ? vercelSrcset(img, [256, 384, 512, 768, 960]) : undefined}
						imageLight={imgLight}
						imageLightSrcset={imgLight ? vercelSrcset(imgLight, [256, 384, 512, 768, 960]) : undefined}
					/>
				{/each}
			</Grid>
			<SectionFoot href={resolve('/projects/')} label="VIEW ALL PROJECTS →" />
		{/if}

		{#if data.notes.length > 0}
			<SectionHead eyebrow="// 0x03" heading="Notes" sublabel="ENGINEERING NOTES & EXPERIMENTS" />
			<Grid cols={3} gap="sm">
				{#each data.notes as note (note.slug)}
					<NoteCard
						idx={note.idx}
						kind={note.kind ?? 'LOG'}
						title={note.title}
						lede={note.lede}
						date={note.date}
						href={resolve(`/notes/${note.slug}/`)}
						imagePlacement="top"
					/>
				{/each}
			</Grid>
			<SectionFoot
				href={resolve('/notes/')}
				label="VIEW ALL NOTES →"
				meta="ENGINEERING NOTES & EXPERIMENTS"
			/>
		{/if}
	</Stack>
</Container>

<Container size="lg">
	<Signature />
</Container>

<style>
	/* Hero portrait — in-flow, left of the heading text. No library equivalent. */
	:global(.hero-heading) {
		display: flex;
		align-items: center;
		gap: 0.25em;
	}
	.hero-portrait {
		height: 2.5em;
		width: auto;
		flex-shrink: 0;
		object-fit: contain;
		object-position: left top;
		pointer-events: none;
		user-select: none;
		mix-blend-mode: screen;
	}
	:global([data-palette='paper']) .hero-portrait {
		mix-blend-mode: multiply;
	}
</style>
