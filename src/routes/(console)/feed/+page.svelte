<script lang="ts">
	import SectionH from '$lib/ui/SectionH.svelte';
	import TagPill from '$lib/ui/TagPill.svelte';
	import type { FeedFrontmatter } from '$lib/types';

	type Entry = FeedFrontmatter & { slug: string };
	type Props = { data: { entries: Entry[] } };
	let { data }: Props = $props();

	function fmt(d: string) {
		return new Date(d)
			.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
			.toUpperCase();
	}
</script>

<div class="wrap">
	<section class="hero">
		<h1>FEED</h1>
		<p class="sub">Short updates from the bench.</p>
		<div class="meta">
			<span><b>{data.entries.length}</b> ENTRIES</span>
			{#if data.entries[0]}
				<span>LATEST <b>{fmt(data.entries[0].date)}</b></span>
			{/if}
		</div>
	</section>

	<SectionH title="ALL ENTRIES" sub="{data.entries.length} TOTAL" />

	<div class="list">
		{#each data.entries as entry}
			<div class="row">
				<span class="date">{fmt(entry.date)}</span>
				<span class="body">{entry.body}</span>
				<div class="tags">
					{#each entry.tags as tag}
						<TagPill>{tag}</TagPill>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
	}
	@media (max-width: 720px) {
		.wrap {
			padding: 0 16px 56px;
		}
	}
	.hero {
		padding: 80px 0 56px;
		border-bottom: 1px solid var(--rule);
	}
	.hero h1 {
		font-weight: 500;
		font-size: clamp(56px, 10vw, 140px);
		line-height: 0.92;
		letter-spacing: -0.04em;
		margin: 0;
	}
	.sub {
		margin-top: 20px;
		font-size: var(--t-lede);
		color: var(--ink-dim);
	}
	.meta {
		margin-top: 24px;
		display: flex;
		gap: 32px;
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
	.list {
		margin-top: 8px;
	}
	.row {
		display: grid;
		grid-template-columns: 80px 1fr 160px;
		gap: 24px;
		padding: 20px 0;
		border-bottom: 1px solid var(--rule);
		align-items: baseline;
	}
	.date {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		color: var(--amber);
		text-transform: uppercase;
	}
	.body {
		font-size: 17px;
		line-height: 1.5;
	}
	.tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: flex-end;
	}
	@media (max-width: 720px) {
		.row {
			grid-template-columns: 1fr;
			gap: 6px;
		}
		.tags {
			justify-content: flex-start;
		}
	}
</style>
