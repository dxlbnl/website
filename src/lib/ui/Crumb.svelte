<script lang="ts">
	type Item = { label: string; href?: string };
	type Props = { path: Item[] };
	let { path }: Props = $props();
</script>

<nav class="crumb">
	<a href="/">[ PATH ]</a>
	<span class="sep">~</span>
	{#each path as item}
		<span class="sep">/</span>
		{#if item.href}
			<a href={item.href}>{item.label}</a>
		{:else}
			<span class="current">{item.label}</span>
		{/if}
	{/each}
</nav>

<style>
	.crumb {
		padding: 16px 0 0;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		letter-spacing: 0.04em;
	}
	a {
		color: var(--ink-dim);
	}
	a:hover {
		color: var(--amber);
	}
	.sep {
		padding: 0 4px;
	}
	.current {
		color: var(--ink);
	}
</style>
