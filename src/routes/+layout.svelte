<script lang="ts">
	import '@fontsource/inter-tight/400.css';
	import '@fontsource/inter-tight/500.css';
	import '@fontsource/inter-tight/600.css';
	import '@fontsource/jetbrains-mono/400.css';
	import '@fontsource/jetbrains-mono/500.css';
	import '../app.css';
	import { onMount } from 'svelte';
	import { getPalette, setPalette } from '$lib/theme.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

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
	injectSpeedInsights();
</script>

<svelte:head>
</svelte:head>

{@render children()}
