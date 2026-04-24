<script lang="ts">
	type Props = { num?: string; title: string; sub?: string };
	let { num, title, sub }: Props = $props();
</script>

<header class="wrap">
	{#if num}<span class="num">{num}</span>{/if}
	<span class="title">{title}</span>
	{#if sub}<span class="sub">{sub}</span>{/if}
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
	.sub {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		margin-left: auto;
	}
</style>
