<script lang="ts">
	import { onMount } from 'svelte';
	import Led from './Led.svelte';

	let t = $state(0);
	let now = $state(new Date());

	onMount(() => {
		let raf: number;
		const loop = () => {
			t++;
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		const clock = setInterval(() => (now = new Date()), 1000);
		return () => {
			cancelAnimationFrame(raf);
			clearInterval(clock);
		};
	});

	const pad = (n: number) => String(n).padStart(2, '0');

	const scopePath = $derived.by(() => {
		const pts: string[] = [];
		for (let i = 0; i <= 60; i++) {
			const x = (i / 60) * 120;
			const y = 9 + Math.sin((i + t * 0.08) * 0.45) * 5 * Math.sin((i + t * 0.03) * 0.15);
			pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
		}
		return `M ${pts.join(' L ')}`;
	});
</script>

<div class="bar">
	<span><Led blink /> PWR 3.3V</span>
	<span><Led tone="cyan" /> NET OK</span>
	<span>T.SYNC {pad(now.getUTCHours())}:{pad(now.getUTCMinutes())}:{pad(now.getUTCSeconds())}</span>
	<span class="spacer"></span>
	<svg viewBox="0 0 120 18" preserveAspectRatio="none" class="scope">
		<path d={scopePath} />
	</svg>
	<span>SYS / DEXTERLABS v3.0</span>
</div>

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 10px 32px;
		border-bottom: 1px solid var(--rule);
		background: var(--bg-sunken);
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-dim);
		background-image: repeating-linear-gradient(
			0deg,
			transparent 0 2px,
			rgba(255, 255, 255, 0.015) 2px 3px
		);
	}
	.bar > span {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.spacer {
		flex: 1;
	}
	.scope {
		width: 120px;
		height: 18px;
		color: var(--cyan);
	}
	.scope path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.2;
	}
</style>
