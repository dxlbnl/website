<script lang="ts">
	import { onMount } from 'svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import SubscribeForm from '$lib/ui/SubscribeForm.svelte';
	import SEO from '$lib/ui/SEO.svelte';

	let email = $state('');
	onMount(() => {
		email = ['hello', 'dxlb.nl'].join('@');
	});
</script>

<SEO
	title="Contact"
	description="Get in touch - hardware commissions, prototype work, or just to say hello."
/>

<div class="wrap">
	<section class="hero">
		<div class="eyebrow">// CONTACT · ONE CHANNEL</div>
		<h1>Say hello.</h1>
		<p class="sub">
			Best way: email. For prototype-for-hire, include what you're trying to test and a rough
			timeline. For everything else, just write.
		</p>
		<div class="email">
			{#if email}<a href="mailto:{email}">{email}</a>{/if}
		</div>
		<div class="meta">
			<a href="https://github.com/dxlbnl" target="_blank" rel="noopener"
				><b>GH</b> github.com/dxlbnl</a
			>
			<a href="https://linkedin.com/in/alexander-esselink" target="_blank" rel="noopener"
				><b>LI</b> linkedin/alexander-esselink</a
			>
			<a href="https://instagram.com/dexterotti" target="_blank" rel="noopener"
				><b>IG</b> @dexterotti</a
			>
		</div>
	</section>

	<section class="mail">
		<div class="eyebrow">// MAILING LIST</div>
		<p class="sub">Occasional updates from the lab - new builds, availability, notes.</p>
		<SubscribeForm />
	</section>

	<Signature />
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
		container-type: inline-size;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
	.hero {
		padding: 48px 0 56px;
		border-bottom: 1px solid var(--rule);
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 16px;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(48px, 8vw, 112px);
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 20px;
	}
	.sub {
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		max-width: 52ch;
		margin-bottom: 0;
	}
	.email {
		margin-top: 40px;
		font-family: var(--mono);
		font-size: 22px;
		letter-spacing: 0.04em;
	}
	.email a {
		color: var(--amber);
		border-bottom: 1px solid transparent;
		transition: border-color 0.15s;
	}
	.email a:hover {
		border-color: var(--amber);
	}
	.meta {
		display: flex;
		gap: 32px;
		flex-wrap: wrap;
		margin-top: 32px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		color: var(--ink-faint);
	}
	.meta a {
		color: var(--ink-faint);
		transition: color 0.15s;
	}
	.meta a:hover {
		color: var(--ink);
	}
	.meta b {
		color: var(--ink-dim);
		font-weight: 500;
		margin-right: 6px;
	}
	.mail {
		padding: 48px 0 56px;
	}
	.mail .sub {
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		max-width: 44ch;
		margin: 0 0 20px;
	}
</style>
