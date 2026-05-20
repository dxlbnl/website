<script lang="ts">
	import { Nav } from '@dxlbnl/ui';
	import Footer from '$lib/ui/Footer.svelte';
	import { page } from '$app/state';
	import { getPalette, togglePalette } from '$lib/theme.svelte';

	let { children } = $props();

	const navItems = [
		{ label: 'CATALOGUE', href: '/catalogue/' },
		{ label: 'PROJECTS', href: '/projects/' },
		{ label: 'NOTES', href: '/notes/' },
		{ label: 'ABOUT', href: '/about/' },
		{ label: 'CONTACT', href: '/contact/' }
	];

	function isActive(href: string) {
		return page.url.pathname === href || (href !== '/' && page.url.pathname.startsWith(href));
	}

	const links = $derived(navItems.map((item) => ({ ...item, active: isActive(item.href) })));

	const breadcrumbs = $derived([
		{ label: '~', href: '/' },
		...page.url.pathname
			.split('/')
			.filter(Boolean)
			.map((s, i, arr) => ({
				label: s.toUpperCase(),
				href: '/' + arr.slice(0, i + 1).join('/') + '/'
			}))
	]);
</script>

<div class="page">
	<Nav
		{links}
		{breadcrumbs}
		palette={getPalette() as 'phosphor' | 'paper'}
		onPaletteToggle={togglePalette}
		sticky={false}
		maxWidth="none"
	/>
	<main>{@render children()}</main>
	<Footer />
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	main {
		flex: 1;
	}
</style>
