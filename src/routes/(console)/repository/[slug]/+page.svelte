<script lang="ts">
	import type { Component, SvelteComponent } from 'svelte';
	import type { RepositoryFrontmatter } from '$lib/types';
	import CrtOverlay from '$lib/ui/Overlay.svelte';
	import HudHeader from '$lib/ui/HudHeader.svelte';

	type Props = {
		data: {
			component: Component<SvelteComponent>;
			metadata: RepositoryFrontmatter;
		};
	};

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>{data.metadata.title} | Dexterlabs Console</title>
</svelte:head>

<main class="log-layout">
	<CrtOverlay />
	<HudHeader systemId="REPOSITORY_LOG" />

	<article class="content">
		<header class="log-header">
			<div class="log-meta">
				<span>DATE: {data.metadata.date}</span>
				<span>TAGS: {data.metadata.tags.join(' // ')}</span>
			</div>
			<h1>{data.metadata.title}</h1>
		</header>
		
		<div class="markdown-body">
			<svelte:component this={data.component} />
		</div>
	</article>

    <div class="log-footer">
        <a href="/repository" class="back-link">&larr; ABORT & RETURN TO REPOSITORY DIRECTORY</a>
    </div>
</main>

<style>
	.log-layout {
		position: relative;
		min-height: 100vh;
		padding: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.log-header {
		margin-bottom: 3rem;
		border-bottom: 2px solid var(--cyber-red);
		padding-bottom: 1rem;
	}

	.log-meta {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.8rem;
		color: var(--text-dim);
		margin-bottom: 1rem;
	}

	.log-header h1 {
		font-family: var(--font-mono);
		color: var(--text-primary);
		text-transform: uppercase;
		font-size: 1.8rem;
		margin: 0;
	}

	.markdown-body {
		font-family: 'Inter', sans-serif;
		color: #e0e0e0;
		line-height: 1.6;
		font-size: 1.1rem;
	}

    :global(.markdown-body p) {
        margin-bottom: 1.5rem;
    }

	.log-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px dotted var(--grid);
	}

	.back-link {
		font-family: var(--font-mono);
		color: var(--text-dim);
		text-decoration: none;
		letter-spacing: 1px;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--cyber-red);
	}
</style>
