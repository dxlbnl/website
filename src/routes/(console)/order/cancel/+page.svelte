<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import Led from '$lib/ui/Led.svelte';
	import SEO from '$lib/ui/SEO.svelte';
</script>

<SEO title="Order Cancelled" description="Your order was not completed. No charge was made." />

<div class="wrap">
	<div class="box">
		<div class="label"><Led tone="amber" /> ORDER CANCELLED</div>
		<h1>No charge made.</h1>
		<p>
			You cancelled the checkout. Nothing was charged. Head back to the catalogue if you'd like to
			try again.
		</p>
		<a href="/catalogue" class="back">← RETURN TO CATALOGUE</a>
	</div>
	<Signature />
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 80px 32px;

		@media (max-width: 720px) {
			padding: 40px 16px;
		}
	}
	.box {
		max-width: 48ch;
	}
	.label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--amber);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 12px;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(32px, 5vw, 48px);
		letter-spacing: -0.02em;
		margin: 0 0 16px;
		line-height: 1;
	}
	p {
		font-size: 17px;
		line-height: 1.6;
		color: var(--ink-dim);
		margin: 0 0 32px;
	}
	.back {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.back:hover {
		color: var(--amber);
	}
</style>
