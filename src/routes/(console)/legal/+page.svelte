<script lang="ts">
	import { Container, PageHero, Stack, Text } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import { resolve } from '$app/paths';
</script>

<SEO
	title="Legal"
	description="Legal information for Dexterlabs - privacy policy, terms and conditions, shipping and returns."
/>

<Container size="lg">
	<Stack gap="md">
		<PageHero variant="hero" eyebrow="// LEGAL · DEXTERLABS" heading="Legal" />
		<Stack gap="sm">
			<Text as="a" href={resolve('/legal/privacy/')}>Privacy Policy</Text>
			<Text as="a" href={resolve('/legal/terms/')}>Terms &amp; Conditions</Text>
			<Text as="a" href={resolve('/legal/shipping/')}>Shipping Policy</Text>
			<Text as="a" href={resolve('/legal/returns/')}>Returns &amp; Refunds</Text>
		</Stack>
	</Stack>
</Container>
