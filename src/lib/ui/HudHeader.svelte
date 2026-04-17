<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let timeString = $state('00:00:00');

	onMount(() => {
		const tick = () => (timeString = new Date().toISOString().split('T')[1].split('.')[0]);
		tick();
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	});

	// Derived path breadcrumb from URL
	let breadcrumb = $derived($page.url.pathname);
</script>

<header class="console-header">
	<div class="left-section">
		<span class="label">[ PATH ]</span>
		<span class="value cyan">~{breadcrumb}</span>
	</div>
	<div class="right-section">
		<span class="label">PWR</span>
		<span class="value">3.3V OK</span>
		<span class="divider"></span>
		<span class="label">T.SYNC</span>
		<span class="value">{timeString}</span>
	</div>
</header>

<style>
	.console-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background: var(--void);
		border-bottom: var(--panel-border);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 1px;
		color: var(--text-dim);
	}

	.left-section,
	.right-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.label {
		color: var(--text-dim);
	}

	.value {
		color: var(--text-main);
	}

	.value.cyan {
		color: var(--cyber-cyan);
	}

	.divider {
		width: 1px;
		height: 12px;
		background: var(--grid);
		margin: 0 0.5rem;
	}
</style>
