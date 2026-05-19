<script lang="ts">
	import { Container, Stack, PageHero, Prose, SectionFoot, Text } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import SubscribeForm from '$lib/ui/SubscribeForm.svelte';
	import { resolve } from '$app/paths';
	import type { Component } from 'svelte';
	import type { MailingFrontmatter } from '$lib/types';

	type Props = { data: { component: Component; mailing: MailingFrontmatter } };
	let { data }: Props = $props();

	let Body = $derived(data.component);
</script>

<SEO
	title={data.mailing.title}
	description={data.mailing.subject}
	type="article"
	articleDate={data.mailing.date}
	noindex
/>

<Container size="sm">
	<PageHero
		eyebrow={`// MAILING · ${data.mailing.date.split('T')[0]}`}
		heading={data.mailing.title}
	/>

	<Stack gap="md">
		<Prose>
			<Body />
		</Prose>

		<SectionFoot href={resolve('/mailings/')} label="← BACK TO MAILINGS" />

		<Stack gap="xs">
			<Text variant="mono" size="xs" color="faint" case="upper">// STAY IN THE LOOP</Text>
			<Text color="dim">Get future mailings delivered to your inbox.</Text>
			<SubscribeForm />
		</Stack>
	</Stack>
</Container>

<Container size="lg">
	<Signature />
</Container>
