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
		font-weight: 600;
	}

	.cyan {
		color: var(--cyber-cyan);
	}

	.red {
		color: var(--cyber-red);
	}

	.magenta {
		color: var(--cyber-magenta);
	}
</style>
