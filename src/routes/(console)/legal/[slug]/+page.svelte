<script lang="ts">
	import { Container, PageHero, Prose } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import type { Component } from 'svelte';
	import type { LegalFrontmatter } from '$lib/types';

	type Props = { data: { component: Component; metadata: LegalFrontmatter } };
	let { data }: Props = $props();
	let Body = $derived(data.component);
</script>

<SEO title={data.metadata.title} description="Legal information for Dexterlabs." />

<Container size="md">
	<PageHero
		eyebrow={`// LEGAL · ${data.metadata.title}`}
		heading={data.metadata.title}
		lede={`Last updated: ${data.metadata.lastUpdated}`}
	/>
	<Prose>
		<Body />
	</Prose>
</Container>
