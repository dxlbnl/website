<script lang="ts">
	import NavCard from '$lib/ui/NavCard.svelte';
	import SocialUplink from '$lib/ui/SocialUplink.svelte';
	import type { Component } from 'svelte';
	import type { ConsoleFrontmatter } from '$lib/types';

	interface Props {
		data: { component: Component; metadata: ConsoleFrontmatter };
	}

	let { data }: Props = $props();
</script>

<div class="console-page">
	<!-- 2. IDENTITY MATRIX -->
	<section class="identity-section">
		<div class="title-wrapper">
			<h1 class="hero-title">{data.metadata?.title || 'DEXTER'}</h1>
		</div>

		<div class="roles">
			<span>[ CODER ]</span>
			<span>[ MAKER ]</span>
			<span>[ HARDWARE ]</span>
		</div>

		<div class="mission-log">
			<p>:: ARCHITECTING MODULAR SYSTEMS</p>
			<p>:: DESIGNING EURORACK CIRCUITRY</p>
			<p>:: EXECUTING SYSTEM INTEGRATION</p>
		</div>
	</section>

	<!-- 3. MAIN NAVIGATION -->
	<nav class="nav-grid">
		<NavCard
			href="/repository"
			index="01"
			title="THE REPOSITORY"
			desc="LOGS // PROCESS // DATA"
			variant="cyan"
		/>

		<NavCard
			href="/catalogue"
			index="02"
			title="THE CATALOGUE"
			desc="HARDWARE // SCHEMATICS // SALES"
			variant="red"
		/>
	</nav>

	<!-- 4. BOTTOM COMMS -->
	<footer class="footer-layout">
		<div class="uplinks">
			<SocialUplink
				href="https://github.com/dxlbnl/"
				protocol="NET.GH"
				label="GITHUB"
				variant="cyan"
			/>
			<SocialUplink
				href="https://www.linkedin.com/in/alexander-esselink-414685a/"
				protocol="NET.LI"
				label="LINKEDIN"
				variant="magenta"
			/>
			<SocialUplink
				href="https://www.instagram.com/dexterotti/"
				protocol="NET.IG"
				label="INSTAGRAM"
				variant="red"
			/>
		</div>

		<div class="copyright">&copy; 2025 DEXTERLABS // ALL SYSTEMS OPERATIONAL</div>
	</footer>
</div>

<style>
	/* Page-Specific Layout Logic Only */
	.console-page {
		padding: 1.5rem 1.5rem 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		margin: 0 auto;
		flex: 1;
		min-height: 0; /* Important for flex child sizing */
	}

	.identity-section {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin: 2rem 0;
	}

	.title-wrapper {
		margin-bottom: 0.5rem;
	}

	.hero-title {
		font-size: clamp(2.5rem, 10vw, 7rem);
		font-weight: 800;
		text-transform: uppercase;
		line-height: 0.9;
		margin: 0;
		color: var(--text-main);
	}

	.roles {
		display: flex;
		gap: 1rem;
		color: var(--cyber-cyan);
		font-size: 0.8rem;
		letter-spacing: 2px;
		flex-wrap: nowrap;
		white-space: nowrap;
	}

	.mission-log {
		margin-top: 2rem;
		padding-left: 1rem;
		border-left: 2px solid var(--grid);
		color: var(--text-dim);
		font-size: 0.75rem;
		line-height: 1.6;
	}

	.nav-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.footer-layout {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		border-top: 1px solid var(--grid);
		padding-top: 1rem;
		margin-top: auto;
	}

	.uplinks {
		display: flex;
		gap: 1.5rem;
	}

	.copyright {
		font-size: 0.6rem;
		color: var(--text-dim);
		letter-spacing: 1px;
	}

	@media (max-width: 768px) {
		.console-page {
			padding: 1rem 1rem 1.5rem 1rem;
		}

		.identity-section {
			margin: 1rem 0;
		}

		.roles {
			font-size: clamp(0.6rem, 3.5vw, 0.8rem);
			gap: 0.5rem;
			letter-spacing: 1px;
		}

		.mission-log {
			margin-top: 2rem;
		}

		.footer-layout {
			flex-direction: column;
			gap: 2rem;
			align-items: flex-start;
		}

		.uplinks {
			flex-direction: column;
			gap: 1rem;
		}
	}

	@media (max-width: 480px) {
		.nav-grid {
			grid-template-columns: 1fr; /* Stack on very small screens */
		}
	}
</style>
