<script lang="ts">
	let { data }: { data: { day: string; visits: number }[] } = $props()
	const max = $derived(Math.max(...data.map((d) => d.visits), 1))
	const W = $derived(data.length > 0 ? 100 / data.length : 100)
</script>

<svg width="100%" height="56" viewBox="0 0 100 56" preserveAspectRatio="none" class="chart">
	<rect x="0" y="0" width="100" height="56" fill="var(--rule)" />
	{#each data as d, i}
		{@const h = d.visits === 0 ? 2 : Math.max((d.visits / max) * 52, 2)}
		<rect
			x={i * W + 0.25}
			y={56 - h}
			width={Math.max(W - 0.5, 0.5)}
			height={h}
			fill="var(--amber)"
			opacity={d.visits === 0 ? 0.25 : 1}
		/>
	{/each}
</svg>

<style>
	.chart {
		display: block;
	}
</style>
