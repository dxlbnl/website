<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		systemId?: string;
	}

	let { systemId = 'DXTR_CORE' }: Props = $props();
	let timeString = $state('00:00:00');

	onMount(() => {
		const tick = () => (timeString = new Date().toISOString().split('T')[1].split('.')[0]);
		tick();
		const interval = setInterval(tick, 1000);
		return () => clearInterval(interval);
	});
</script>

<header class="hud-header">
	<div>
		<span class="label">SYS.ID</span>
		<span class="value cyan">{systemId}</span>
	</div>
	<div>
		<span class="label">T.SYNC</span>
		<span class="value">{timeString}</span>
	</div>
</header>

<style>
	.hud-header {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid var(--grid);
		padding-bottom: 1rem;
		font-size: 0.7rem;
		letter-spacing: 2px;
		color: var(--text-dim);
		margin-bottom: 4rem;
	}
	.label {
		margin-right: 0.5rem;
	}
	.value {
		color: var(--text-main);
	}
	.value.cyan {
		color: var(--cyber-cyan);
		text-shadow: 0 0 5px rgba(0, 240, 255, 0.5);
	}
</style>
