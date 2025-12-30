<script lang="ts">
	type Props = {
		specs: Record<string, string>;
	};

	let { specs }: Props = $props();

	const entries = $derived(Object.entries(specs));
</script>

<div class="specs-container">
	<h3 class="specs-title">TECHNICAL SPECIFICATIONS</h3>
	<div class="specs-grid">
		{#each entries as [key, value]}
			<div class="spec-row">
				<span class="spec-label">{key}</span>
				<span class="spec-value">{value}</span>
			</div>
		{/each}
	</div>
</div>

<style>
	.specs-container {
		border: 1px solid var(--grid);
		padding: 1.5rem;
		background: rgba(0, 0, 0, 0.3);
	}

	.specs-title {
		font-size: 0.9rem;
		color: var(--cyber-cyan);
		letter-spacing: 2px;
		margin: 0 0 1rem 0;
		font-weight: 600;
	}

	.specs-grid {
		display: grid;
		gap: 0.75rem;
	}

	.spec-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--grid);
	}

	.spec-row:last-child {
		border-bottom: none;
	}

	.spec-label {
		color: var(--text-dim);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.spec-value {
		color: var(--text-main);
		font-size: 0.9rem;
		font-weight: 600;
		text-align: right;
	}

	@media (min-width: 768px) {
		.specs-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
