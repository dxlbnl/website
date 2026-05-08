<script lang="ts">
	type Props = {
		href: string;
		eyebrow: string;
		name: string;
		description?: string;
		label?: string;
		external?: boolean;
	};
	let { href, eyebrow, name, description, label = 'VIEW →', external = false }: Props = $props();
</script>

<a {href} class="cta" target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
	<div class="cta-body">
		<span class="cta-eyebrow">{eyebrow}</span>
		<span class="cta-name">{name}</span>
		{#if description}<span class="cta-desc">{description}</span>{/if}
	</div>
	<span class="cta-link">{label}</span>
</a>

<style>
	.cta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		border: 1px solid var(--amber);
		padding: 24px 32px;
		margin-bottom: 32px;
		color: inherit;
		transition: background 0.15s;
	}
	.cta:hover {
		background: color-mix(in srgb, var(--amber) 6%, transparent);
	}
	.cta-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.cta-eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
	}
	.cta-name {
		font-weight: 500;
		font-size: var(--t-lede);
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.cta-desc {
		font-size: var(--t-mono);
		color: var(--ink-dim);
		line-height: 1.4;
	}
	.cta-link {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--amber);
		white-space: nowrap;
		flex-shrink: 0;
	}
</style>
