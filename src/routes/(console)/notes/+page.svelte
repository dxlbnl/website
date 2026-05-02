<script lang="ts">
	import SectionH from '$lib/ui/SectionH.svelte';
	import Placeholder from '$lib/ui/Placeholder.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import { resolveLogImage, vercelSrcset } from '$lib/utils/image';
	import { fmtDate } from '$lib/utils/fmt';
	import type { NoteFrontmatter } from '$lib/types';
	import SEO from '$lib/ui/SEO.svelte';
	import { resolve } from '$app/paths';

	type Entry = NoteFrontmatter & { slug: string; idx: number };
	type Props = { data: { entries: Entry[] } };
	let { data }: Props = $props();
</script>

<SEO
	title="Notes"
	description="Build logs, post-mortems, and longer writing from the lab. Signed by Dexter."
/>

<div class="wrap">
	<PageHero eyebrow="// NOTES · LONGER PIECES" title="Notes.">
		<p class="sub">
			Longer writing. Build logs, post-mortems, opinions. Written when something took long enough to
			be worth explaining. Signed by <em>Dexter</em>.
		</p>
		<div class="meta">
			<span><b>{data.entries.length}</b> PIECES</span>
			{#if data.entries[0]}
				<span><b>LATEST</b> {fmtDate(data.entries[0].date)}</span>
			{/if}
		</div>
	</PageHero>

	<SectionH num="// INDEX" title="All notes" sub="NEWEST FIRST" />

	{#each data.entries as entry (entry.slug)}
		<a href={resolve(`/notes/${entry.slug}/`)} class="idx-row">
			<div class="idx-n">{String(entry.idx).padStart(2, '0')}</div>
			<div class="idx-t">
				{entry.title}
				<small
					>{fmtDate(entry.date)} · {entry.kind ?? 'LOG'}{entry.lede
						? ' · ' + entry.lede.slice(0, 80) + (entry.lede.length > 80 ? '…' : '')
						: ''}</small
				>
			</div>
			<div class="idx-i">
				{#if entry.images?.[0]}
					{@const thumbSrc = resolveLogImage(entry.images[0], entry.slug)}
					<img
						src={thumbSrc}
						srcset={vercelSrcset(thumbSrc, [256, 384, 512])}
						sizes="240px"
						alt=""
						loading="lazy"
					/>
				{:else}
					<Placeholder label={entry.kind ?? 'IMG'} />
				{/if}
			</div>
		</a>
	{/each}
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
	.idx-row {
		display: grid;
		grid-template-columns: 60px 1fr 240px;
		gap: 32px;
		align-items: end;
		padding: 28px 0 24px;
		border-bottom: 1px solid var(--rule);
		color: inherit;
		transition: background 0.15s;

		@container (max-width: 720px) {
			grid-template-columns: 40px 1fr;
		}

		&:hover {
			background: var(--bg-elev);
		}
	}
	.idx-n {
		font-family: var(--mono);
		font-size: var(--t-h3);
		color: var(--ink-faint);
		letter-spacing: -0.02em;
	}
	.idx-t {
		font-size: var(--t-subtitle);
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}
	.idx-t small {
		display: block;
		font-family: var(--mono);
		font-size: var(--t-mono);
		font-weight: 400;
		color: var(--ink-dim);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-top: 8px;
	}
	.idx-i {
		width: 100%;
		aspect-ratio: 16 / 9;
		overflow: hidden;
		border: 1px solid var(--rule);

		@container (max-width: 720px) {
			display: none;
		}
	}
	.idx-i img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
