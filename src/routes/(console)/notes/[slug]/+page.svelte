<script lang="ts">
	import { Container, Stack, PageHero, Prose, Rule, Spread, Button, Text } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import ImageCarousel from '$lib/ui/ImageCarousel.svelte';
	import ProductCta from '$lib/ui/ProductCta.svelte';
	import { resolveLogImage } from '$lib/utils/image';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import type { NoteFrontmatter, ProductFrontmatter } from '$lib/types';
	import type { Region } from '$lib/utils/location';

	type Props = {
		data: {
			component: Component;
			metadata: NoteFrontmatter;
			product?: ProductFrontmatter;
			region: Region;
		};
	};
	let { data }: Props = $props();

	const images = $derived(
		(data.metadata.images ?? []).map((img: string) => resolveLogImage(img, page.params.slug ?? ''))
	);
	let Body = $derived(data.component);
</script>

<SEO
	title={data.metadata.title}
	description={data.metadata.lede}
	image={images[0]}
	type="article"
	articleDate={data.metadata.date}
	tags={data.metadata.tags}
/>

<Container size="sm">
	<Stack gap="lg">
		<PageHero
			eyebrow={`// ${data.metadata.kind ?? 'LOG'} · ${data.metadata.date.split('T')[0]}`}
			heading={data.metadata.title}
			lede={data.metadata.lede}
		/>

		{#if images.length > 0}
			<ImageCarousel {images} />
		{/if}

		<Prose>
			<Body />
		</Prose>

		{#if data.product}
			<ProductCta product={data.product} region={data.region} />
		{/if}

		<Rule />

		<Spread>
			<Button as="a" href={resolve('/notes/')} variant="back">← BACK TO NOTES</Button>
			<Text variant="mono" size="xs" color="faint" case="upper">SIGNED / DEXTER</Text>
		</Spread>

		<Signature />
	</Stack>
</Container>
