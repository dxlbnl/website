<script>
	import SEO from '$lib/ui/SEO.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import { resolve } from '$app/paths';
</script>

<SEO
	title="Legal"
	description="Legal information for Dexterlabs - privacy policy, terms and conditions, shipping and returns."
/>

<div class="wrap">
	<PageHero eyebrow="// LEGAL · DEXTERLABS" title="Legal">
		<ul>
			<li><a href={resolve('/legal/privacy/')}>Privacy Policy</a></li>
			<li><a href={resolve('/legal/terms/')}>Terms &amp; Conditions</a></li>
			<li><a href={resolve('/legal/shipping/')}>Shipping Policy</a></li>
			<li><a href={resolve('/legal/returns/')}>Returns &amp; Refunds</a></li>
		</ul>
	</PageHero>
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 32px 0 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	a {
		font-size: var(--t-body);
		border-bottom: 1px solid var(--rule-strong);
		transition: border-color 0.15s;
		&:hover {
			border-color: var(--amber);
		}
	}
</style>
