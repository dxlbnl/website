<script lang="ts">
	import '@fontsource/inter-tight/latin-400.css';
	import '@fontsource/inter-tight/latin-500.css';
	import '@fontsource/inter-tight/latin-600.css';
	import '@fontsource/jetbrains-mono/latin-400.css';
	import '@fontsource/jetbrains-mono/latin-500.css';
	import '../app.css';
	import { getPalette } from '$lib/theme.svelte';
	import { dev } from '$app/environment';
	import { page } from '$app/state';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';

	let { children } = $props();

	$effect(() => {
		const current = getPalette();
		if (document.documentElement.dataset.palette !== current) {
			document.documentElement.dataset.palette = current;
		}
	});

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<svelte:head>
	<link rel="canonical" href={page.url.origin + page.url.pathname} />
	<link
		rel="alternate"
		type="application/rss+xml"
		title="Dexterlabs — Notes"
		href="/notes/rss.xml"
	/>
</svelte:head>

{@render children()}
