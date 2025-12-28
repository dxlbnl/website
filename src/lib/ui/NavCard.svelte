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

<a {href} class="nav-link" style="--active-color: {activeColor}">
	<div class="nav-index">{index}</div>
	<div class="nav-content">
		<span class="link-title">{title}</span>
		<span class="link-desc">{desc}</span>
	</div>
	<div class="nav-border"></div>
</a>

<style>
	.nav-link {
		position: relative;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		padding: 1.5rem 0;
		transition: 0.3s ease;
	}

	.nav-index {
		font-size: 0.7rem;
		color: var(--text-dim);
		margin-bottom: 0.5rem;
	}

	.link-title {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-main);
		margin-bottom: 0.25rem;
		text-shadow:
			1px 0 rgba(0, 240, 255, 0.4),
			-1px 0 rgba(255, 0, 255, 0.4);
	}

	.link-desc {
		font-size: 0.7rem;
		color: var(--text-dim);
		letter-spacing: 1px;
	}

	.nav-border {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 1px;
		background: var(--grid);
		transition: all 0.3s;
	}

	.nav-link:hover .link-title {
		color: var(--active-color);
		text-shadow:
			2px 0 var(--text-main),
			-2px 0 var(--active-color);
	}
	.nav-link:hover .nav-border {
		background: var(--active-color);
		box-shadow: 0 0 10px var(--active-color);
	}
</style>
