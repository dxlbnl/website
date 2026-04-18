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
	let segments = $derived($page.url.pathname.split('/').filter(Boolean));
</script>

<header class="console-header">
	<div class="left-section">
		<div class="breadcrumb-nav">
			<a href="/" class="crumb">
				<span class="label">[ PATH ]</span>
				~</a
			>{#each segments as segment, i}<span class="crumb-separator">/</span><a
					href={'/' + segments.slice(0, i + 1).join('/')}
					class="crumb"
					class:active={i === segments.length - 1}>{segment}</a
				>{/each}
		</div>
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

	.left-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.right-section {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		white-space: nowrap;
	}

	.breadcrumb-nav {
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.crumb {
		color: var(--text-dim);
		text-decoration: none;
		transition: color 0.1s;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.crumb:hover {
		color: var(--text-main);
	}

	.crumb.active {
		color: var(--cyber-cyan);
	}

	.crumb-separator {
		color: var(--text-dim);
		opacity: 0.5;
		padding: 0;
		user-select: none;
	}

	.label {
		color: var(--text-dim);
	}

	.value {
		color: var(--text-main);
	}

	.divider {
		width: 1px;
		height: 12px;
		background: var(--grid);
		margin: 0 0.5rem;
	}

	@media (max-width: 768px) {
		.console-header {
			font-size: 0.7rem;
			gap: 1rem;
		}

		.left-section .label {
			display: none; /* Hide [ PATH ] label on mobile */
		}
	}

	@media (max-width: 480px) {
		.console-header {
			padding: 0.5rem 0.75rem;
		}

		.right-section .label:first-child,
		.right-section .label:first-child + .value,
		.right-section .divider {
			display: none; /* Hide PWR section on very small screens */
		}

		.right-section .label {
			font-size: 0.6rem;
		}
	}
</style>
