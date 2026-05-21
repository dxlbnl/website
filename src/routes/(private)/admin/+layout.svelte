<script lang="ts">
	import { Nav } from '@dxlbnl/ui';
	import { page } from '$app/state';
	import { getPalette, togglePalette } from '$lib/theme.svelte';

	let { children } = $props();

	const adminItems = [
		{ label: 'ORDERS', href: '/admin/orders' },
		{ label: 'MAILINGS', href: '/admin/mailings' },
		{ label: 'ANALYTICS', href: '/admin/analytics' }
	];

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(href);
	}

	const links = $derived(adminItems.map((item) => ({ ...item, active: isActive(item.href) })));
</script>

<div class="page">
	<Nav
		{links}
		palette={getPalette() as 'phosphor' | 'paper'}
		onPaletteToggle={togglePalette}
		sticky={false}
		maxWidth="none"
	/>
	<main>{@render children()}</main>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	main {
		flex: 1;
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
		padding: 0 32px 80px;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
</style>
