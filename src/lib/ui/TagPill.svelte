<script lang="ts">
	import type { Snippet } from 'svelte';
	type Props = {
		tone?: 'amber' | 'cyan' | '';
		children: Snippet;
	};
	let { tone = '', children }: Props = $props();
</script>

<span class="pill" class:amber={tone === 'amber'} class:cyan={tone === 'cyan'}>
	{@render children()}
</span>

<style>
	.pill {
		display: inline-block;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-dim);
		padding: 2px 6px;
		border: 1px solid var(--rule);
	}
	.pill.amber {
		color: var(--amber);
		border-color: var(--amber);
	}
	.pill.cyan {
		color: var(--cyan);
		border-color: var(--cyan);
	}
</style>
