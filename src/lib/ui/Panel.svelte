<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'cyan' | 'red' | 'magenta';

	type Props = {
		label: string;
		variant?: Variant;
		children?: Snippet;
	};

	let { label, variant = 'cyan', children }: Props = $props();

	const colorMap: Record<Variant, string> = {
		cyan: 'var(--cyber-cyan)',
		red: 'var(--cyber-red)',
		magenta: 'var(--cyber-magenta)'
	};

	const labelColor = $derived(colorMap[variant]);
</script>

<div class="panel" style="--label-color: {labelColor}">
	<div class="panel-label">{label}</div>
	<div class="panel-content">
		{@render children?.()}
	</div>
</div>

<style>
	.panel {
		position: relative;
		border: 1px solid var(--grid);
		padding: 0.75rem;
	}

	.panel-label {
		position: absolute;
		top: -8px;
		left: 8px;
		background: var(--void);
		padding: 0 4px;
		font-size: var(--t-micro);
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: var(--label-color);
	}

	.panel-content {
		line-height: 1.3;
		font-size: var(--t-mono);
	}
</style>
