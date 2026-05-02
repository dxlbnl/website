<script lang="ts">
	import TagPill from '$lib/ui/TagPill.svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import { fmtDateShort } from '$lib/utils/fmt';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';

	type Props = { data: PageData };
	let { data }: Props = $props();

	const fmt = fmtDateShort;
</script>

<SEO
	title="Feed"
	description="Live updates from the lab - builds in progress, links, and notes from the bench."
/>

<div class="wrap">
	<PageHero eyebrow="// FEED · THE LIVE BENCH" title="Feed.">
		<p class="sub">
			Short posts from the bench. What I'm building, breaking, or shipping right now - the kind of
			thing I'd otherwise lose in a chat thread. Longer writeups live in <a
				href={resolve('/notes/')}>notes</a
			>.
		</p>
		<div class="meta">
			<span><b>{data.entries.length}</b> POSTS</span>
			{#if data.entries[0]}
				<span><b>LATEST</b> {fmt(data.entries[0].date)}</span>
			{/if}
			<span><b>CADENCE</b> WHEN IT'S INTERESTING</span>
		</div>
	</PageHero>

	<div class="list">
		{#each data.entries as entry (entry.date)}
			<div class="row">
				<span class="date">{fmt(entry.date)}</span>
				<span class="body">{entry.body}</span>
				<div class="tags">
					{#each entry.tags as tag (tag)}
						<TagPill>{tag}</TagPill>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class="end">// end of feed. newest on top.</div>

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
		margin-top: 20px;
		font-size: var(--t-lede);
		color: var(--ink-dim);
		max-width: 52ch;
		line-height: 1.55;
	}
	.sub a {
		color: var(--ink);
		border-bottom: 1px solid var(--rule);
	}
	.sub a:hover {
		border-color: var(--ink);
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
	.end {
		margin-top: 24px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
	}
	.row {
		display: grid;
		grid-template-columns: 80px 1fr 160px;
		gap: 24px;
		padding: 20px 0;
		border-bottom: 1px solid var(--rule);
		align-items: baseline;

		@container (max-width: 720px) {
			grid-template-columns: 1fr;
			gap: 6px;
		}
	}
	.date {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		color: var(--amber);
		text-transform: uppercase;
	}
	.body {
		font-size: var(--t-body);
		line-height: 1.5;
	}
	.tags {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: flex-end;

		@container (max-width: 720px) {
			justify-content: flex-start;
		}
	}
</style>
