<script lang="ts">
	import { onMount } from 'svelte';
	import { Container, Stack, Inline, PageHero, Rule, Text } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import SubscribeForm from '$lib/ui/SubscribeForm.svelte';

	let email = $state('');
	onMount(() => {
		email = ['hello', 'dxlb.nl'].join('@');
	});
</script>

<SEO
	title="Contact"
	description="Get in touch - hardware commissions, prototype work, or just to say hello."
/>

<Container size="lg">
	<PageHero
		variant="hero"
		eyebrow="// CONTACT · ONE CHANNEL"
		heading="Say hello."
		lede="Best way: email. For prototype-for-hire, include what you're trying to test and a rough timeline. For everything else, just write."
	>
		<Stack gap="md">
			{#if email}
				<Text
					as="a"
					href="mailto:{email}"
					variant="mono"
					color="amber"
					size="lg"
					case="none"
				>
					{email}
				</Text>
			{/if}
			<Inline gap="md">
				<Text
					as="a"
					href="https://github.com/dxlbnl"
					target="_blank"
					rel="noopener"
					variant="mono"
					color="faint"
					case="lower"
				>
					<Text as="span" variant="mono" color="dim">gh</Text>
					github.com/dxlbnl
				</Text>
				<Text
					as="a"
					href="https://linkedin.com/in/alexander-esselink"
					target="_blank"
					rel="noopener"
					variant="mono"
					color="faint"
					case="lower"
				>
					<Text as="span" variant="mono" color="dim">li</Text>
					linkedin/alexander-esselink
				</Text>
				<Text
					as="a"
					href="https://instagram.com/dexterotti"
					target="_blank"
					rel="noopener"
					variant="mono"
					color="faint"
					case="lower"
				>
					<Text as="span" variant="mono" color="dim">ig</Text>
					@dexterotti
				</Text>
			</Inline>
		</Stack>
	</PageHero>

	<Stack gap="lg">
		<Rule />
		<Stack gap="xs">
			<Text variant="mono" size="xs" color="faint" case="upper">// MAILING LIST</Text>
			<Text color="dim">Occasional updates from the lab - new builds, availability, notes.</Text>
			<SubscribeForm />
		</Stack>
	</Stack>
</Container>

<Container size="lg">
	<Signature />
</Container>
