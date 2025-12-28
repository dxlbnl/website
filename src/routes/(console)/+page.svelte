<script lang="ts">
	import CrtOverlay from '$lib/ui/Overlay.svelte';
	import GlitchText from '$lib/ui/GlitchText.svelte';
	import NavCard from '$lib/ui/NavCard.svelte';
	import SocialUplink from '$lib/ui/SocialUplink.svelte';
	import HudHeader from '$lib/ui/HudHeader.svelte';
	import type { Component } from 'svelte';
	import type { ConsoleFrontmatter } from '$lib/types';

	interface Props {
		data: { component: Component; metadata: ConsoleFrontmatter };
	}

	let { data }: Props = $props();
</script>

<CrtOverlay />

<main class="console-layout">
	<!-- 1. TOP BAR -->
	<HudHeader systemId="DXTR_LABS_V3" />

	<!-- 2. IDENTITY MATRIX -->
	<section class="identity-section">
		<div class="title-wrapper">
			<GlitchText text={data.metadata?.title || 'DEXTER'} />
		</div>

		<div class="roles">
			<span>[ CODER ]</span>
			<span>[ MAKER ]</span>
			<span>[ ARTIST ]</span>
		</div>

		<div class="mission-log">
			<p>:: ARCHITECTING MODULAR SYSTEMS</p>
			<p>:: DESIGNING EURORACK CIRCUITRY</p>
			<p>:: EXECUTING GENERATIVE ART</p>
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

		<NavCard
			href="/art"
			index="03"
			title="ART GRID"
			desc="VISUALS // GENERATIVE // CHAOS"
			variant="magenta"
		/>
	</nav>

	<!-- 4. BOTTOM COMMS -->
	<footer class="footer-layout">
		<div class="uplinks">
			<SocialUplink href="#" protocol="NET.GH" label="GITHUB" variant="cyan" />
			<SocialUplink href="#" protocol="NET.LI" label="LINKEDIN" variant="magenta" />
			<SocialUplink href="#" protocol="MKT.TD" label="TINDIE" variant="red" />
		</div>

		<div class="copyright">&copy; 2025 DEXTERLABS // ALL SYSTEMS OPERATIONAL</div>
	</footer>
</main>

<style>
	/* Page-Specific Layout Logic Only */
	.console-layout {
		min-height: 100vh;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		max-width: 1200px;
		margin: 0 auto;
	}

	.identity-section {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		margin: 4rem 0;
	}

	.title-wrapper {
		font-size: clamp(3rem, 10vw, 8rem);
		margin-bottom: 1rem;
	}

	.roles {
		display: flex;
		gap: 1.5rem;
		color: var(--cyber-cyan);
		font-size: 0.9rem;
		letter-spacing: 2px;
	}

	.mission-log {
		margin-top: 3rem;
		padding-left: 1rem;
		border-left: 2px solid var(--grid);
		color: var(--text-dim);
		font-size: 0.8rem;
		line-height: 1.8;
	}

	.nav-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
		margin-bottom: 4rem;
	}

	@media (min-width: 768px) {
		.nav-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.footer-layout {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		border-top: 1px solid var(--grid);
		padding-top: 1.5rem;
	}

	.uplinks {
		display: flex;
		gap: 2rem;
	}

	.copyright {
		font-size: 0.6rem;
		color: var(--text-dim);
		letter-spacing: 1px;
	}

	@media (max-width: 600px) {
		.footer-layout {
			flex-direction: column;
			gap: 2rem;
			align-items: flex-start;
		}
		.uplinks {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
