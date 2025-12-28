<script lang="ts">
	type Variant = 'cyan' | 'red' | 'magenta';

	let {
		href,
		protocol = 'NET.UNK',
		label,
		variant = 'cyan'
	}: {
		href: string;
		protocol: string;
		label: string;
		variant?: Variant;
	} = $props();

	const colorMap: Record<Variant, string> = {
		cyan: 'var(--cyber-cyan)',
		red: 'var(--cyber-red)',
		magenta: 'var(--cyber-magenta)'
	};

	const activeColor = $derived(colorMap[variant]);
</script>

<a
	{href}
	target="_blank"
	rel="noopener noreferrer"
	class="uplink"
	style="--signal-color: {activeColor}"
>
	<span class="protocol">[{protocol}]</span>
	<span class="label">{label}</span>
	<div class="underline-glitch"></div>
</a>

<style>
	.uplink {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		font-size: 0.75rem;
		color: var(--text-dim);
		padding: 0.5rem 0;
	}

	.protocol {
		opacity: 0.5;
	}
	.label {
		font-weight: 700;
		letter-spacing: 1px;
	}

	.uplink:hover {
		color: var(--text-main);
		text-shadow: 0 0 5px var(--signal-color);
	}
	.uplink:hover .protocol {
		opacity: 1;
		color: var(--signal-color);
	}

	.glitch-line {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0%;
		height: 1px;
		background: var(--signal-color);
		box-shadow: 0 0 4px var(--signal-color);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
	.uplink:hover .glitch-line {
		width: 100%;
	}
</style>
