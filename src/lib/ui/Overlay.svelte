<div class="overlay"></div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background:
			linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
			radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.6) 100%);
		background-size:
			100% 3px,
			100% 100%;
		pointer-events: none;
		z-index: 99;
		opacity: 0.8;
	}
</style>
