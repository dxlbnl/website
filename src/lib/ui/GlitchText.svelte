<script lang="ts">
	import { onMount } from 'svelte';

	let { text = 'SYSTEM', tag = 'h1' } = $props();

	const GLYPHS = '█▓▒░<>/[]#$!_-\\|';

	// Internal state
	let displayText = $state(text);
	let isGlitching = $state(false);

	// The Chaos Engine
	const triggerGlitch = () => {
		isGlitching = true;
		let iterations = 0;

		const scrambleInterval = setInterval(() => {
			displayText = text
				.split('')
				.map((char) => {
					if (char === ' ') return ' ';
					return Math.random() < 0.3 ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : char;
				})
				.join('');

			iterations++;
			if (iterations >= 3) {
				clearInterval(scrambleInterval);
				displayText = text; // Restore
				isGlitching = false;
				scheduleNext();
			}
		}, 50);
	};

	const scheduleNext = () => {
		const delay = Math.random() * 5000 + 2000;
		setTimeout(triggerGlitch, delay);
	};

	onMount(() => {
		scheduleNext();
	});
</script>

<svelte:element this={tag} class="glitch-base" class:active={isGlitching} data-text={displayText}>
	{displayText}
</svelte:element>

<style>
	.glitch-base {
		position: relative;
		text-transform: uppercase;
		color: var(--text-main);
		text-shadow:
			2px 2px 0px var(--cyber-magenta),
			-2px -2px 0px var(--cyber-cyan);
		font-size: inherit;
		font-weight: 900;
		margin: 0;
		line-height: 0.9;
		letter-spacing: -2px;
	}

	.active {
		animation: skew-shake 0.1s infinite;
	}

	/* Pseudo-elements for the RGB split effect */
	.active::before,
	.active::after {
		content: attr(data-text);
		position: absolute;
		inset: 0;
		opacity: 0.8;
		background: var(--void);
	}
	.active::before {
		color: var(--cyber-magenta);
		transform: translate(-4px, 0);
		mix-blend-mode: screen;
	}
	.active::after {
		color: var(--cyber-cyan);
		transform: translate(4px, 0);
		mix-blend-mode: screen;
	}
</style>
