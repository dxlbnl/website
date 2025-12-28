<script lang="ts">
	let { label, value, chroma = false } = $props();
</script>

<div class="hud-item">
	<span class="label">{label}</span>
	<span class="value" class:chroma-static={chroma}>{value}</span>
</div>

<style>
	.hud-item {
		display: flex;
		align-items: baseline;
		font-family: var(--mono);
		font-size: 0.7rem;
		letter-spacing: 2px;
		color: var(--text-dim);
	}

	.value {
		color: var(--cyber-cyan);
		margin-left: 0.5rem;
	}

	.chroma-static {
		position: relative;
		display: inline-block;
	}

	/* The subtle static ghosting effect */
	.chroma-static::before {
		content: attr(
			data-text
		); /* Note: requires parent to pass data-text if we want exact match, or use mix-blend on the element itself */
		/* Simplified CSS-only version for reusable component without complex props */
		text-shadow:
			1px 0 rgba(255, 0, 255, 0.7),
			-1px 0 rgba(0, 255, 255, 0.7);
	}
</style>
