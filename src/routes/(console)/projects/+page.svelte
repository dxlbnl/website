<script lang="ts">
	import PageHero from '$lib/ui/PageHero.svelte';
	import SectionH from '$lib/ui/SectionH.svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import ProjectCard from '$lib/ui/ProjectCard.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import type { ProjectFrontmatter } from '$lib/types';

	type Props = { data: { projects: ProjectFrontmatter[] } };
	let { data }: Props = $props();
</script>

<SEO title="Projects" description="Software projects from the lab — open source tools, experiments, and side ventures." />

<div class="wrap">
	<PageHero eyebrow="// PROJECTS · SOFTWARE" title="Projects.">
		<p class="sub">
			Open source tools, experiments, and side ventures. Built by <em>Dexter</em>.
		</p>
		<div class="meta">
			<span><b>{data.projects.length}</b> PROJECTS</span>
		</div>
	</PageHero>

	<SectionH num="// INDEX" title="All projects" />

	<div class="card-grid">
		{#each data.projects as project (project.slug)}
			<ProjectCard {project} />
		{/each}
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
	.sub {
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		max-width: 56ch;
	}
	.sub em {
		font-style: italic;
	}
	.meta {
		display: flex;
		gap: 24px;
		margin-top: 20px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.meta b {
		color: var(--ink);
		font-weight: 500;
		margin-right: 4px;
	}
</style>
