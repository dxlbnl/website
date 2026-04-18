<script lang="ts">
	import HudHeader from '$lib/ui/HudHeader.svelte';

	let { children } = $props();
</script>

<div class="console-shell">
	<HudHeader />
	<main class="console-viewport">
		{@render children()}
	</main>
</div>

<style>
	.console-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: var(--void);
		overflow: hidden;
	}

	.console-viewport {
		flex: 1;
		background: var(--grid);
		display: flex;
		flex-direction: column;
		position: relative;
		overflow-y: auto;
	}
</style>
