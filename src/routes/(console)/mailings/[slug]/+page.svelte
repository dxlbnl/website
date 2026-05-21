<script lang="ts">
	import { Container, Stack, SectionFoot, Text } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import SubscribeForm from '$lib/ui/SubscribeForm.svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let frame: HTMLIFrameElement | undefined = $state();

	function resizeFrame() {
		if (!frame?.contentDocument) return;
		frame.style.height = frame.contentDocument.body.scrollHeight + 'px';
	}
</script>

<svelte:window onresize={resizeFrame} />

<SEO
	title={data.mailing.title}
	description={data.mailing.subject}
	type="article"
	articleDate={data.mailing.date}
	noindex
/>

<Container size="md">
	<Stack gap="md">
		<iframe
			bind:this={frame}
			srcdoc={data.emailHtml}
			title={data.mailing.title}
			class="email-frame"
			scrolling="no"
			onload={resizeFrame}
		></iframe>

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

<style>
	.email-frame {
		width: 100%;
		border: 1px solid var(--rule);
		background: var(--bg);
		display: block;
	}
</style>
