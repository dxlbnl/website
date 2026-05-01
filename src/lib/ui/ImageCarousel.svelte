<script lang="ts">
	import { vercelSrcset } from '$lib/utils/image';

	type Props = { images: string[] };
	let { images }: Props = $props();

	let active = $state(0);

	function prev() {
		active = (active - 1 + images.length) % images.length;
	}

	function next() {
		active = (active + 1) % images.length;
	}
</script>

{#if images.length > 0}
	<div class="carousel">
		<div class="viewport">
			<img
				src={images[active]}
				srcset={vercelSrcset(images[active], [512, 768, 960, 1280])}
				sizes="(max-width: 720px) calc(100vw - 32px), min(680px, calc(100vw - 64px))"
				alt="Image {active + 1} of {images.length}"
				loading="eager"
			/>
			{#if images.length > 1}
				<div class="regions">
					<button onclick={prev} class="region" aria-label="Previous image"></button>
					<button onclick={next} class="region" aria-label="Next image"></button>
				</div>
			{/if}
		</div>
		{#if images.length > 1}
			<div class="nav">
				<button onclick={prev} aria-label="Previous">←</button>
				<span class="counter">{active + 1} / {images.length}</span>
				<button onclick={next} aria-label="Next">→</button>
			</div>
		{/if}
	</div>
{/if}

<style>
	.carousel {
		border: 1px solid var(--rule);
		overflow: hidden;
		margin: 32px 0;
	}
	.viewport {
		position: relative;
		width: 100%;
	}
	img {
		width: 100%;
		height: auto;
		display: block;
		aspect-ratio: 16 / 9;
		object-fit: cover;
	}
	.regions {
		position: absolute;
		inset: 0;
		display: flex;
		z-index: 10;
	}
	.region {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		transition: background 0.15s;
	}
	.region:first-child {
		cursor: w-resize;
	}
	.region:last-child {
		cursor: e-resize;
	}
	.region:active {
		background: rgba(255, 255, 255, 0.04);
	}
	.nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		border-top: 1px solid var(--rule);
		background: var(--bg-sunken);
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		color: var(--ink-dim);
	}
	.nav button {
		background: none;
		border: none;
		color: var(--ink-faint);
		cursor: pointer;
		font-family: var(--mono);
		font-size: var(--t-mono);
		padding: 4px 8px;
		transition: color 0.1s;
	}
	.nav button:hover {
		color: var(--amber);
	}
	.counter {
		letter-spacing: 0.12em;
	}
</style>
