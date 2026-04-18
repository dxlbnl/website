<script lang="ts">
	import { resolveLogImage } from '$lib/utils/image';
	import type { RepositoryFrontmatter } from '$lib/types';

	type EntryDef = RepositoryFrontmatter & { slug: string };

	type Props = {
		data: { entries: EntryDef[] };
	};

	let { data }: Props = $props();
</script>

<div class="repository-index">
	<header class="index-header">
		<h1>REPOSITORY_INDEX</h1>
		<div class="index-meta">
			<span>DESC: SYSTEM LOGS // ADVENTURES // PROCESS</span>
			<span>ENTRIES: {data.entries.length}</span>
		</div>
	</header>

	<div class="entry-list">
		{#each data.entries as entry}
			<a href="/repository/{entry.slug}" class="entry-row">
				<div class="thumbnail">
					{#if entry.images && entry.images.length > 0}
						<img src={resolveLogImage(entry.images[0], entry.slug)} alt="" loading="lazy" />
					{:else}
						<div class="placeholder">LOG://{entry.slug.split('-')[1]}</div>
					{/if}
				</div>
				<div class="entry-content">
					<span class="entry-title">{entry.title}</span>
					<div class="entry-meta">
						<span class="entry-date">{entry.date.split('T')[0]}</span>
						<span class="entry-divider">//</span>
						<div class="entry-tags">
							{entry.tags.join(' // ')}
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.repository-index {
		padding: 2rem;
		max-width: 1000px;
		margin: 0 auto;
		width: 100%;
		min-height: 100%;
	}

	.index-header {
		margin-bottom: 3rem;
		border-bottom: 1px solid var(--grid);
		padding-bottom: 1rem;
	}

	.index-header h1 {
		font-family: var(--font-mono);
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text-main);
		margin: 0 0 0.5rem 0;
	}

	.index-meta {
		display: flex;
		gap: 2rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-dim);
		letter-spacing: 1px;
	}

	.entry-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.entry-row {
		display: flex;
		align-items: stretch;
		background: var(--void);
		border: 1px solid var(--grid);
		text-decoration: none;
		font-family: var(--font-mono);
		color: var(--text-main);
		transition: all 0.1s ease;
		overflow: hidden;
	}

	.entry-row:hover {
		color: var(--cyber-cyan);
		border-color: var(--cyber-cyan);
		transform: translateX(4px);
	}

	.thumbnail {
		width: 120px;
		min-width: 120px;
		background: var(--grid);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		border-right: 1px solid var(--grid);
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.placeholder {
		font-size: 0.6rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.entry-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 1.5rem 2.5rem;
		min-height: 100px;
	}

	.entry-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.6rem;
		color: var(--text-dim);
		text-transform: uppercase;
		letter-spacing: 1.5px;
		margin-top: 0.25rem;
	}

	.entry-title {
		text-transform: uppercase;
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-main);
		letter-spacing: 0.5px;
		line-height: 1.2;
	}

	.entry-date {
		font-family: var(--font-mono);
	}

	.entry-divider {
		color: var(--grid);
	}

	.entry-tags {
		display: flex;
		gap: 0.5rem;
	}

	.tag {
		opacity: 0.8;
	}

	@media (max-width: 768px) {
		.entry-row {
			flex-direction: column;
		}

		.thumbnail {
			width: 100%;
			height: 150px;
			border-right: none;
			border-bottom: 1px solid var(--grid);
		}

		.entry-content {
			padding: 1.5rem;
			gap: 0.75rem;
			min-height: auto;
		}

		.entry-meta {
			position: static;
			margin-bottom: 0.25rem;
		}

		.entry-title {
			font-size: 1rem;
		}

		.entry-date {
			min-width: auto;
		}

		.entry-divider {
			display: none;
		}

		.index-meta {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
