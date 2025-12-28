<script lang="ts">
	import { onMount } from 'svelte';

	export let data: {
		frontmatter?: { title?: string };
	} = {};

	// --- CONFIG ---
	const GLYPHS = '█▓▒░<>/[]#$!_-\\|';
	const BASE_TITLE = data.frontmatter?.title || 'DEXTER';

	// --- STATE ---
	let timeString = '';
	let displayTitle = BASE_TITLE;
	let isGlitching = false;

	onMount(() => {
		// 1. CLOCK
		const updateTime = () => {
			const now = new Date();
			timeString = now.toISOString().split('T')[1].split('.')[0];
		};
		updateTime();
		const clockInterval = setInterval(updateTime, 1000);

		// 2. THE BITFLIP ENGINE
		const triggerGlitch = () => {
			if (isGlitching) return;
			isGlitching = true;

			// Perform 3 rapid text scrambles
			let iterations = 0;
			const maxIterations = 3;

			const scrambleInterval = setInterval(() => {
				displayTitle = BASE_TITLE.split('')
					.map((char, index) => {
						// Keep spaces, 30% chance to flip a character
						if (char === ' ') return ' ';
						if (Math.random() < 0.3) {
							return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
						}
						return char;
					})
					.join('');

				iterations++;

				if (iterations >= maxIterations) {
					clearInterval(scrambleInterval);
					// Restore Order
					displayTitle = BASE_TITLE;
					isGlitching = false;

					// Schedule next glitch (Random 2s to 7s)
					scheduleNextGlitch();
				}
			}, 50); // Speed of character changes (ms)
		};

		const scheduleNextGlitch = () => {
			const delay = Math.random() * 5000 + 2000;
			setTimeout(triggerGlitch, delay);
		};

		// Start the chaos loop
		scheduleNextGlitch();

		return () => {
			clearInterval(clockInterval);
		};
	});
</script>

<!-- CRT TEXTURE OVERLAY -->
<div class="crt-overlay"></div>

<main class="hud-container">
	<!-- HUD TOP BAR -->
	<header class="hud-header">
		<div class="sys-id">
			<span class="label">SYS.ID</span>
			<span class="value static-chroma">DXTR_LBS_CORE</span>
		</div>
		<div class="sys-time">
			<span class="label">T.SYNC</span>
			<span class="value">{timeString}</span>
		</div>
	</header>

	<!-- CORE IDENTITY -->
	<section class="identity-grid">
		<!-- 
      The Title binds to {displayTitle}. 
      The class .glitch-active is toggled by JS to trigger the violent CSS shake.
    -->
		<h1 class="main-title" class:glitch-active={isGlitching} data-text={displayTitle}>
			{displayTitle}
		</h1>

		<div class="roles">
			<div class="role-item">
				<span class="bracket">[</span> CODER <span class="bracket">]</span>
			</div>
			<div class="role-item">
				<span class="bracket">[</span> MAKER <span class="bracket">]</span>
			</div>
			<div class="role-item">
				<span class="bracket">[</span> ARTIST <span class="bracket">]</span>
			</div>
		</div>

		<p class="mission-text">
			:: ARCHITECTING MODULAR SYSTEMS <br />
			:: DESIGNING EURORACK CIRCUITRY <br />
			:: EXECUTING GENERATIVE ART
		</p>
	</section>

	<!-- NAVIGATION -->
	<nav class="nav-grid">
		<!-- LINK 01 -->
		<a href="/repository" class="nav-link">
			<div class="nav-index">01</div>
			<div class="nav-content">
				<span class="link-title">THE REPOSITORY</span>
				<span class="link-desc">LOGS // PROCESS // DATA</span>
			</div>
			<div class="nav-border"></div>
		</a>

		<!-- LINK 02 -->
		<a href="/catalogue" class="nav-link hardware">
			<div class="nav-index">02</div>
			<div class="nav-content">
				<span class="link-title">THE CATALOGUE</span>
				<span class="link-desc">HARDWARE // SCHEMATICS // SALES</span>
			</div>
			<div class="nav-border"></div>
		</a>

		<!-- LINK 03 -->
		<a href="/art" class="nav-link art">
			<div class="nav-index">03</div>
			<div class="nav-content">
				<span class="link-title">ART GRID</span>
				<span class="link-desc">VISUALS // GENERATIVE // CHAOS</span>
			</div>
			<div class="nav-border"></div>
		</a>
	</nav>

	<!-- FOOTER -->
	<footer class="hud-footer">
		<div class="diag-col">
			<span class="label">MEM</span>
			<div class="bar-container"><div class="bar" style="width: 42%"></div></div>
		</div>
		<div class="diag-col">
			<span class="label">CPU</span>
			<div class="bar-container"><div class="bar" style="width: 12%"></div></div>
		</div>
		<div class="diag-col copyright">&copy; 2025 DEXTERLABS</div>
	</footer>
</main>

<style>
	/* --- CYBERPUNK VARIABLES --- */
	:global(:root) {
		--void: #050505;
		--grid: #1a1a1a;
		--text-dim: #666;

		/* The Palette */
		--cyber-cyan: #00f0ff;
		--cyber-magenta: #ff00ff;
		--cyber-red: #ff2a6d;
		--cyber-wht: #e0e0e0;

		--mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
	}

	/* --- BASE SETUP --- */
	.hud-container {
		background-color: var(--void);
		color: var(--cyber-wht);
		font-family: var(--mono);
		min-height: 100vh;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
		z-index: 1;
		/* Static Blur - Softens the harsh digital edges */
		text-shadow: 0 0 1px rgba(255, 255, 255, 0.1);
	}

	/* --- CRT TEXTURE OVERLAY --- */
	.crt-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: 
      /* Scanlines */
			linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
			/* Vignette */ radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.6) 100%);
		background-size:
			100% 3px,
			100% 100%;
		pointer-events: none;
		z-index: 99;
		opacity: 0.8;
	}

	/* --- STATIC MISALIGNMENT (Bad Convergence) --- */
	.static-chroma {
		position: relative;
		display: inline-block;
	}
	.static-chroma::before {
		content: 'DXTR_LBS_CORE'; /* Simplified for CSS demo, usually attr() */
		position: absolute;
		left: -1px;
		top: 0;
		color: rgba(255, 0, 255, 0.7);
		mix-blend-mode: screen;
		z-index: -1;
	}

	/* --- THE TITLE & GLITCH LOGIC --- */
	.main-title {
		font-size: clamp(3rem, 8vw, 6rem);
		font-weight: 900;
		margin: 0;
		line-height: 0.9;
		letter-spacing: -4px;
		color: var(--cyber-wht);
		text-transform: uppercase;
		position: relative;
		/* Static State: Clean, sharp, dominant */
	}

	/* When JS sets this class, the Violent Shaking happens */
	.glitch-active {
		animation: skew-shake 0.1s infinite;
		color: var(--cyber-wht);
	}

	.glitch-active::before,
	.glitch-active::after {
		content: attr(data-text);
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		opacity: 0.8;
	}

	.glitch-active::before {
		color: var(--cyber-magenta);
		transform: translate(-4px, 0);
		mix-blend-mode: screen;
	}

	.glitch-active::after {
		color: var(--cyber-cyan);
		transform: translate(4px, 0);
		mix-blend-mode: screen;
	}

	/* The physical screen shake */
	@keyframes skew-shake {
		0% {
			transform: skewX(0deg) translate(0, 0);
		}
		25% {
			transform: skewX(5deg) translate(2px, 2px);
		}
		50% {
			transform: skewX(-5deg) translate(-2px, -2px);
		}
		75% {
			transform: skewX(2deg) translate(1px, -1px);
		}
		100% {
			transform: skewX(0deg) translate(0, 0);
		}
	}

	/* --- REST OF LAYOUT --- */

	.hud-header {
		display: flex;
		justify-content: space-between;
		border-bottom: 1px solid var(--grid);
		padding-bottom: 1rem;
		font-size: 0.7rem;
		letter-spacing: 2px;
		color: var(--text-dim);
	}
	.value {
		color: var(--cyber-cyan);
		margin-left: 0.5rem;
	}

	.identity-grid {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-width: 800px;
		margin: 4rem auto;
		width: 100%;
	}

	.roles {
		display: flex;
		gap: 1.5rem;
		margin-top: 1.5rem;
		font-size: 0.9rem;
		letter-spacing: 1px;
		color: var(--cyber-cyan);
	}
	.bracket {
		color: var(--text-dim);
	}

	.mission-text {
		margin-top: 3rem;
		font-size: 0.8rem;
		line-height: 1.8;
		color: var(--text-dim);
		border-left: 2px solid var(--grid);
		padding-left: 1rem;
	}

	/* --- NAVIGATION --- */
	.nav-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		max-width: 800px;
		margin: 0 auto 4rem auto;
		width: 100%;
	}

	@media (min-width: 768px) {
		.nav-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.nav-link {
		position: relative;
		display: flex;
		flex-direction: column;
		text-decoration: none;
		padding: 1rem 0;
		transition: 0.3s ease;
	}

	.nav-index {
		font-size: 0.7rem;
		color: var(--text-dim);
		margin-bottom: 0.5rem;
	}

	.link-title {
		display: block;
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--cyber-wht);
		margin-bottom: 0.25rem;
		transition: color 0.1s;
		/* Static Aberration on Links */
		text-shadow:
			1px 0 rgba(0, 240, 255, 0.4),
			-1px 0 rgba(255, 0, 255, 0.4);
	}

	.link-desc {
		display: block;
		font-size: 0.65rem;
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

	/* HOVER STATES */
	.nav-link:hover .link-title {
		color: var(--cyber-cyan);
		text-shadow:
			2px 0 var(--cyber-red),
			-2px 0 var(--cyber-cyan);
	}
	.nav-link:hover .nav-border {
		background: var(--cyber-cyan);
		box-shadow: 0 0 10px var(--cyber-cyan);
	}

	.nav-link.hardware:hover .link-title {
		color: var(--cyber-red);
		text-shadow:
			2px 0 var(--cyber-cyan),
			-2px 0 var(--cyber-red);
	}
	.nav-link.hardware:hover .nav-border {
		background: var(--cyber-red);
		box-shadow: 0 0 10px var(--cyber-red);
	}

	/* --- FOOTER --- */
	.hud-footer {
		display: flex;
		gap: 2rem;
		border-top: 1px solid var(--grid);
		padding-top: 1rem;
		font-size: 0.6rem;
		color: var(--text-dim);
	}

	.diag-col {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.bar-container {
		width: 60px;
		height: 4px;
		background: var(--grid);
	}
	.bar {
		height: 100%;
		background: var(--cyber-cyan);
	}
	.copyright {
		margin-left: auto;
	}
</style>
