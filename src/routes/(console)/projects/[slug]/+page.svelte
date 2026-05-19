<script lang="ts">
	import {
		Container,
		Stack,
		PageHero,
		Button,
		Prose,
		KvList,
		SectionFoot,
		Text
	} from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import ImageCarousel from '$lib/ui/ImageCarousel.svelte';
	import { resolveProjectImage } from '$lib/utils/image';
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import type { ProjectFrontmatter } from '$lib/types';

	type Props = {
		data: { component: Component; metadata: ProjectFrontmatter; images: string[] };
	};
	let { data }: Props = $props();

	const heroDark = $derived(data.metadata.image ? resolveProjectImage(data.metadata.image) : null);
	const carouselImages = $derived(heroDark ? [heroDark] : data.images);

	let Body = $derived(data.component);

	const stackItems = $derived(
		data.metadata.stack
			? Object.entries(data.metadata.stack).map(([key, value]) => ({
					key,
					value: value as string
				}))
			: []
	);
</script>

<SEO
	title={data.metadata.title}
	description={data.metadata.description}
	image={heroDark ?? data.images[0]}
	type="article"
	tags={data.metadata.tags}
/>

<Container size="sm">
	<PageHero variant="hero" heading={data.metadata.title} lede={data.metadata.description}>
		{#snippet eyebrow()}
			<Text variant="mono" size="xs" color="faint" case="upper">
				{data.metadata.tags.join(' · ')}
			</Text>
		{/snippet}
		{#if data.metadata.url}
			<Button
				as="a"
				href={data.metadata.url}
				variant="cta"
				target="_blank"
				rel="noopener noreferrer">VISIT →</Button
			>
		{/if}
		{#if data.metadata.github}
			<Button
				as="a"
				href={data.metadata.github}
				variant="cta"
				target="_blank"
				rel="noopener noreferrer">GITHUB →</Button
			>
		{/if}
	</PageHero>

	<Stack gap="md">
		{#if carouselImages.length > 0}
			<ImageCarousel images={carouselImages} />
		{/if}

		<Prose>
			<Body />
		</Prose>

		{#if stackItems.length > 0}
			<Stack gap="xs">
				<Text variant="mono" size="xs" color="faint" case="upper">// STACK</Text>
				<KvList items={stackItems} />
			</Stack>
		{/if}

		<SectionFoot
			href={resolve('/projects/')}
			label="← BACK TO PROJECTS"
			meta="SIGNED / DEXTER"
		/>
	</Stack>
</Container>

<Container size="lg">
	<Signature />
</Container>
