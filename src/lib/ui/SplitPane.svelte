<script lang="ts">
	import type { Snippet } from 'svelte';

	let { left, right }: { left?: Snippet, right?: Snippet } = $props();
</script>

<div class="hacker-split">
	<div class="split-pane left-pane">
		{#if left}
			{@render left()}
		{/if}
	</div>
	<div class="split-pane right-pane">
		{#if right}
			{@render right()}
		{/if}
	</div>
</div>

<style>
	.hacker-split {
		display: grid;
		/* 1fr 1fr split or 40/60 split, we'll go with equal halves for now as default */
		grid-template-columns: 1fr 1fr;
		gap: 1px; /* The 1px gap reveals the grid background, acting as a border line */
		background: var(--grid);
		border: var(--panel-border);
		width: 100%;
		height: 100%;
		min-height: 100%;
	}

	.split-pane {
		background: var(--void);
		padding: 2rem;
		overflow-y: auto;
		position: relative;
	}

	@media (max-width: 768px) {
		.hacker-split {
			grid-template-columns: 1fr;
			grid-template-rows: auto;
			height: auto;
			min-height: auto;
		}

		.split-pane {
			overflow-y: visible;
			height: auto;
		}
	}
</style>
