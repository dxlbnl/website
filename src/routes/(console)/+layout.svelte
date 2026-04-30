<script lang="ts">
	import Nav from '$lib/ui/Nav.svelte';
	import Footer from '$lib/ui/Footer.svelte';
	import { onMount } from 'svelte';

	let { children, data } = $props();
</script>

<div class="page">
	<Nav />
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
