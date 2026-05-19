<script lang="ts">
	import { Container, Stack, PageHero, SectionHead, Text, NoteCard } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import { fmtDate } from '$lib/utils/fmt';
	import { resolveLogImage, vercelSrcset } from '$lib/utils/image';
	import { resolve } from '$app/paths';
	import type { NoteFrontmatter } from '$lib/types';

	type Entry = NoteFrontmatter & { slug: string; idx: number };
	type Props = { data: { entries: Entry[] } };
	let { data }: Props = $props();
</script>

<SEO
	title="Notes"
	description="Build logs, post-mortems, and longer writing from the lab. Signed by Dexter."
/>

<Container size="lg">
	<Stack gap="lg">
		<PageHero
			variant="hero"
			eyebrow="// NOTES · LONGER PIECES"
			heading="Notes."
			lede="Longer writing. Build logs, post-mortems, opinions. Written when something took long enough to be worth explaining. Signed by Dexter."
		>
			<Text variant="mono" size="xs" color="faint" case="upper">
				<Text as="span" color="ink">{data.entries.length}</Text> PIECES
			</Text>
			{#if data.entries[0]}
				<Text variant="mono" size="xs" color="faint" case="upper">
					<Text as="span" color="ink">LATEST</Text>
					{fmtDate(data.entries[0].date)}
				</Text>
			{/if}
		</PageHero>

		<SectionHead eyebrow="// INDEX" heading="All notes" sublabel="NEWEST FIRST" />

		<Stack gap="md">
			{#each data.entries as entry (entry.slug)}
				{@const thumbSrc = entry.images?.[0]
					? resolveLogImage(entry.images[0], entry.slug)
					: undefined}
				<NoteCard
					idx={entry.idx}
					kind={entry.kind ?? 'LOG'}
					title={entry.title}
					lede={entry.lede}
					date={fmtDate(entry.date)}
					href={resolve(`/notes/${entry.slug}/`)}
					image={thumbSrc}
					imageSrcset={thumbSrc ? vercelSrcset(thumbSrc, [256, 384, 512]) : undefined}
					imagePlacement="side"
				/>
			{/each}
		</Stack>
	</Stack>
</Container>
