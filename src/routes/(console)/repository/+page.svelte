<script lang="ts">
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
				<span class="entry-date">{entry.date.split('T')[0]}</span>
				<span class="entry-divider">::</span>
				<span class="entry-title">{entry.title}</span>
				<span class="entry-tags">
					{#each entry.tags as tag}
						<span class="tag">[{tag}]</span>
					{/each}
				</span>
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
		align-items: center;
		padding: 1rem 1.5rem;
		/* Using void/black for the link background as requested */
		background: var(--void);
		border: 1px solid var(--grid);
		text-decoration: none;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		color: var(--text-main);
		transition: all 0.1s ease;
	}

	.entry-row:hover {
		color: var(--cyber-cyan);
		border-color: var(--cyber-cyan);
		transform: translateX(4px);
	}

	.entry-date {
		color: var(--text-dim);
		min-width: 100px;
	}

	.entry-divider {
		margin: 0 1rem;
		color: var(--grid);
	}

	.entry-title {
		flex: 1;
		text-transform: uppercase;
	}

	.entry-tags {
		display: flex;
		gap: 0.5rem;
		font-size: 0.7rem;
		color: var(--text-dim);
	}

	@media (max-width: 768px) {
		.entry-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.25rem;
			padding: 1.25rem;
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
