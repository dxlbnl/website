<script lang="ts">
	import { Container, PageHero, Stack, Text, NoteCard } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import { fmtDate } from '$lib/utils/fmt';
	import { resolve } from '$app/paths';
	import type { MailingFrontmatter } from '$lib/types';

	type Props = { data: { entries: MailingFrontmatter[] } };
	let { data }: Props = $props();
</script>

<SEO
	title="Mailings"
	description="Occasional updates from the lab - new builds, availability, notes from the bench."
/>

<Container size="lg">
	<PageHero
		variant="hero"
		border
		eyebrow="// MAILINGS · FROM THE LAB"
		heading="Mailings."
		lede="Occasional updates - new builds, availability, notes from the lab."
	>
		<Text variant="mono" size="xs" color="faint" case="upper">
			<Text as="span" color="ink">{data.entries.length}</Text> ISSUES
		</Text>
		{#if data.entries[0]}
			<Text variant="mono" size="xs" color="faint" case="upper">
				<Text as="span" color="ink">LATEST</Text>
				{fmtDate(data.entries[0].date)}
			</Text>
		{/if}
	</PageHero>

	<Stack gap="md">
		{#each data.entries as entry, i (entry.slug)}
			<NoteCard
				idx={i + 1}
				kind="ISSUE"
				title={entry.title}
				lede={entry.subject}
				date={fmtDate(entry.date)}
				href={resolve(`/mailings/${entry.slug}/`)}
			/>
		{/each}
	</Stack>
</Container>
