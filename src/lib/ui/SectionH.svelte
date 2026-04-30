<script lang="ts">
	type Props = { num?: string; title: string; sub?: string; children?: import('svelte').Snippet };
	let { num, title, sub, children }: Props = $props();
</script>

<header class="wrap">
	{#if num}<span class="num">{num}</span>{/if}
	<span class="title">{title}</span>
	<div class="right">
		{#if sub}<span class="sub">{sub}</span>{/if}
		{#if children}{@render children()}{/if}
	</div>
</header>

<style>
	.wrap {
		display: flex;
		align-items: baseline;
		gap: 16px;
		padding: 40px 0 12px;
		border-bottom: 1px solid var(--rule);
	}
	.num {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		letter-spacing: 0.12em;
	}
	.title {
		font-weight: 500;
		font-size: var(--t-h3);
		letter-spacing: -0.01em;
	}
	.right {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
</style>
