<script>
	import SEO from '$lib/ui/SEO.svelte';
</script>

<SEO
	title="Legal"
	description="Legal information for Dexterlabs — privacy policy, terms and conditions, shipping and returns."
/>

<div class="wrap">
	<div class="eyebrow">// LEGAL · DEXTERLABS</div>
	<h1>Legal</h1>
	<ul>
		<li><a href="/legal/privacy/">Privacy Policy</a></li>
		<li><a href="/legal/terms/">Terms &amp; Conditions</a></li>
		<li><a href="/legal/shipping/">Shipping Policy</a></li>
		<li><a href="/legal/returns/">Returns &amp; Refunds</a></li>
	</ul>
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 48px 32px 80px;

		@media (max-width: 720px) {
			padding: 32px 16px 56px;
		}
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 16px;
		text-transform: uppercase;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(36px, 5vw, 56px);
		letter-spacing: -0.02em;
		line-height: 1.05;
		margin: 0 0 32px;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	a {
		font-size: 17px;
		border-bottom: 1px solid var(--rule-strong);
		transition: border-color 0.15s;
		&:hover {
			border-color: var(--amber);
		}
	}
</style>
