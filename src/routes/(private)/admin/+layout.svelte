<script lang="ts">
	import Nav from '$lib/ui/Nav.svelte';
	let { children } = $props();

	const adminItems = [
		{ label: 'ORDERS', href: '/admin/orders' },
		{ label: 'MAILINGS', href: '/admin/mailings' }
	];
</script>

<div class="page">
	<Nav items={adminItems} />
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
