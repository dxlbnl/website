<script lang="ts">
	import { Container, Inline, PageHero, Button, Led, Text } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const isPreorder = $derived(data.product?.status === 'coming-soon');
	const productName = $derived(data.product?.name ?? 'your module');

	const headline = $derived(isPreorder ? 'Pre-order received.' : 'Order received.');
	const label = $derived(isPreorder ? 'PRE-ORDER RECEIVED' : 'ORDER CONFIRMED');
	const lede = $derived(
		isPreorder
			? `Thanks for the support. I'm working hard to get ${productName} ready for you. I'll make sure to keep you updated on the progress.`
			: `Thanks for the order. I'll be shipping ${productName} soon! You'll get an email with tracking as soon as it's on its way.`
	);
</script>

<SEO
	title={isPreorder ? 'Pre-order Confirmed' : 'Order Confirmed'}
	description={isPreorder
		? "Thanks for the support. We'll be in touch as development progresses."
		: "Your order is in. We'll be in touch when your batch ships."}
/>

<Container size="lg">
	<PageHero heading={headline} {lede}>
		{#snippet eyebrow()}
			<Inline gap="xs">
				<Led color="ok" />
				<Text variant="eyebrow" color="ok">{label}</Text>
			</Inline>
		{/snippet}
		<Button as="a" href={resolve('/catalogue/')} variant="back">← RETURN TO CATALOGUE</Button>
	</PageHero>
</Container>

<Container size="lg">
	<Signature />
</Container>
