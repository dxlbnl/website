<script lang="ts">
	import type { ProductStatus } from '$lib/types';

	type Props = {
		status: ProductStatus;
	};

	let { status }: Props = $props();

	const statusConfig = {
		'available': { label: 'AVAILABLE', color: 'cyan' },
		'sold-out': { label: 'SOLD OUT', color: 'red' },
		'coming-soon': { label: 'COMING SOON', color: 'magenta' }
	};

	const config = $derived(statusConfig[status]);
</script>

<span class="status-badge {config.color}">
	[ {config.label} ]
</span>

<style>
	.status-badge {
		display: inline-block;
		font-size: 0.7rem;
		letter-spacing: 1px;
		padding: 0.25rem 0.5rem;
		border: 1px solid;
		font-weight: 600;
	}

	.cyan {
		color: var(--cyber-cyan);
		border-color: var(--cyber-cyan);
		box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
	}

	.red {
		color: var(--cyber-red);
		border-color: var(--cyber-red);
		box-shadow: 0 0 8px rgba(255, 42, 109, 0.3);
	}

	.magenta {
		color: var(--cyber-magenta);
		border-color: var(--cyber-magenta);
		box-shadow: 0 0 8px rgba(255, 0, 255, 0.3);
	}
</style>
