<script lang="ts">
	import {
		Container,
		Stack,
		Inline,
		Spread,
		Rule,
		Heading,
		Text,
		Led,
		Button
	} from '@dxlbnl/ui';
	import { resolve } from '$app/paths';

	const body =
		"You cancelled the checkout. Nothing was charged. Head back to the catalogue if you'd like to try again.";
</script>

<svelte:head>
	<title>Order Cancelled</title>
	<meta name="description" content="Your order was not completed. No charge was made." />
</svelte:head>

<Container size="lg">
	<Stack gap="lg">
		<Stack gap="md">
			<Inline gap="xs">
				<Led color="amber" />
				<Text variant="eyebrow" color="amber">ORDER CANCELLED</Text>
			</Inline>
			<Heading level={1}>No charge made.</Heading>
			<Text color="dim">{body}</Text>
			<Button as="a" href={resolve('/catalogue/')} variant="back">RETURN TO CATALOGUE</Button>
		</Stack>

		<Rule />

		<Spread gap="md">
			<Stack gap="xs">
				<Text variant="eyebrow">// SIGNED</Text>
				<Text variant="lede">— Dexter, in the lab</Text>
			</Stack>
			<Stack gap="xs">
				<Text variant="eyebrow">// SHIPPED BY</Text>
				<Text variant="lede">DEXTERLABS / a one-person lab</Text>
			</Stack>
		</Spread>
	</Stack>
</Container>
