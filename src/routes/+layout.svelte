<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { getPalette, setPalette } from '$lib/theme.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	import SEO from '$lib/ui/SEO.svelte';

	let { children } = $props();

	$effect(() => {
		document.documentElement.dataset.palette = getPalette();
	});

	onMount(() => {
		const saved = localStorage.getItem('dxlb-palette');
		setPalette(
			saved ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'phosphor' : 'paper')
		);
	});

	injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

<SEO />

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{@render children()}
