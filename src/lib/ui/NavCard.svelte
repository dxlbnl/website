<script lang="ts">
	type Variant = 'cyan' | 'red' | 'magenta';

	let {
		href,
		index = '00',
		title,
		desc,
		variant = 'cyan'
	}: {
		href: string;
		index?: string;
		title: string;
		desc: string;
		variant?: Variant;
	} = $props();

	// Map variant strings to CSS variables for dynamic coloring
	const colorMap: Record<Variant, string> = {
		cyan: 'var(--cyber-cyan)',
		red: 'var(--cyber-red)',
		magenta: 'var(--cyber-magenta)'
	};

	const activeColor = $derived(colorMap[variant]);
</script>

<a {href} class="nav-card" style="--active-color: {activeColor}">
	<div class="nav-index">{index}</div>
	<div class="nav-content">
		<span class="link-title">{title}</span>
		<span class="link-desc">{desc}</span>
	</div>
</a>

<style>
	.nav-card {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--grid);
		transition: all 0.2s ease;
	}

	.nav-index {
		font-size: 0.7rem;
		color: var(--text-dim);
		margin-bottom: 0.5rem;
		letter-spacing: 1px;
	}

	.link-title {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: 0.25rem;
		transition: color 0.2s;
	}

	.link-desc {
		font-size: 0.7rem;
		color: var(--text-dim);
		letter-spacing: 1px;
	}

	/* Hover State */
	.nav-card:hover {
		border-color: var(--active-color);
		background: rgba(255, 255, 255, 0.05);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
	}

	.nav-card:hover .link-title {
		color: var(--active-color);
	}
</style>
