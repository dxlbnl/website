<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ProjectFrontmatter } from '$lib/types';
	import { resolveProjectImage, vercelSrcset } from '$lib/utils/image';

	type Props = { project: ProjectFrontmatter };
	let { project }: Props = $props();

	const imgDark = $derived(project.image ? resolveProjectImage(project.image) : null);
	const imgLight = $derived(project.imageLight ? resolveProjectImage(project.imageLight) : null);
	const cta = $derived(project.url ? 'VIEW PROJECT' : 'OPEN SOURCE');
</script>

<a href={resolve(`/projects/${project.slug}/`)} class="card">
	<div class="img">
		{#if imgDark || imgLight}
			{#if imgDark}
				<img
					class="dark-img"
					src={imgDark}
					srcset={vercelSrcset(imgDark, [256, 384, 512, 768, 960])}
					sizes="(max-width: 820px) calc(100vw - 32px), (max-width: 1000px) calc(50vw - 40px), calc(33.33vw - 32px)"
					alt={project.title}
					loading="eager"
				/>
			{/if}
			{#if imgLight}
				<img
					class="light-img"
					src={imgLight}
					srcset={vercelSrcset(imgLight, [256, 384, 512, 768, 960])}
					sizes="(max-width: 820px) calc(100vw - 32px), (max-width: 1000px) calc(50vw - 40px), calc(33.33vw - 32px)"
					alt={project.title}
					loading="eager"
				/>
			{/if}
		{:else}
			{project.slug.toUpperCase()} · PROJECT
		{/if}
	</div>
	<div class="body">
		<div class="tags">
			{#each project.tags as tag (tag)}
				<span class="tag">{tag}</span>
			{/each}
		</div>
		<h3 class="title">{project.title}</h3>
		<p class="desc">{project.description}</p>
	</div>
	<div class="cta">
		<span>{cta} →</span>
	</div>
</a>

<style>
	.card {
		border: 1px solid var(--rule);
		background: var(--bg-rail);
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.img {
		aspect-ratio: 14 / 9;
		background: repeating-linear-gradient(
			135deg,
			var(--bg-sunken) 0 10px,
			var(--bg-elev) 10px 20px
		);
		border-bottom: 1px solid var(--rule);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.12em;
		overflow: hidden;
	}
	.img img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	:global([data-palette='paper']) .light-img { display: block; }
	:global([data-palette='paper']) .dark-img { display: none; }
	.light-img { display: none; }
	.body {
		padding: 12px 14px 10px;
		display: flex;
		flex-direction: column;
		gap: 6px;
		flex: 1;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.tag {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.tag + .tag::before {
		content: '·';
		margin-right: 4px;
	}
	.title {
		font-weight: 500;
		font-size: var(--t-lede);
		letter-spacing: -0.01em;
		line-height: 1.2;
	}
	.desc {
		font-size: var(--t-mono);
		color: var(--ink-dim);
		line-height: 1.4;
	}
	.cta {
		border-top: 1px solid var(--rule);
		padding: 10px 14px;
		display: flex;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-dim);
		transition:
			background 0.15s,
			color 0.15s;
	}
	.card:hover .cta {
		background: var(--amber);
		color: var(--bg);
	}
</style>
