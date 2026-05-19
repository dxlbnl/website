<script lang="ts">
	import { Container, Stack, PageHero, Button, Inline, Led, Text } from '@dxlbnl/ui';
	import { resolve } from '$app/paths';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
</script>

<SEO title="Order Cancelled" description="Your order was not completed. No charge was made." />

<Container size="lg">
	<Stack gap="lg">
		<PageHero
			heading="No charge made."
			lede="You cancelled the checkout. Nothing was charged. Head back to the catalogue if you'd like to try again."
		>
			{#snippet eyebrow()}
				<Inline gap="xs">
					<Led color="amber" />
					<Text variant="eyebrow" color="amber">ORDER CANCELLED</Text>
				</Inline>
			{/snippet}
			<Button as="a" href={resolve('/catalogue/')} variant="back">← RETURN TO CATALOGUE</Button>
		</PageHero>
		<Signature />
	</Stack>
</Container>
