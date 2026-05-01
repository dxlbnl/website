<script lang="ts">
	import Signature from '$lib/ui/Signature.svelte';
	import SubscribeForm from '$lib/ui/SubscribeForm.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import type { Component } from 'svelte';
	import type { MailingFrontmatter } from '$lib/types';
	import { resolve } from '$app/paths';

	type Props = { data: { component: Component; mailing: MailingFrontmatter } };
	let { data }: Props = $props();
</script>

<SEO
	title={data.mailing.title}
	description={data.mailing.subject}
	type="article"
	articleDate={data.mailing.date}
/>

<div class="wrap">
	<article>
		<div class="eyebrow">// MAILING · {data.mailing.date.split('T')[0]}</div>
		<h1>{data.mailing.title}</h1>
		<div class="body">
			<data.component />
		</div>
	</article>

	<div class="post-foot">
		<a href={resolve('/mailings/')} class="back">← BACK TO MAILINGS</a>
	</div>

	<section class="subscribe">
		<div class="subscribe-label">// STAY IN THE LOOP</div>
		<p>Get future mailings delivered to your inbox.</p>
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
	article {
		max-width: 68ch;
		padding: 48px 0 40px;
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
		font-size: clamp(32px, 5vw, 56px);
		line-height: 1;
		letter-spacing: -0.02em;
		margin: 0 0 32px;
	}
	.body {
		font-size: 17px;
		line-height: 1.65;
		color: var(--ink-dim);

		:global(h2) {
			font-weight: 500;
			font-size: 22px;
			margin: 32px 0 8px;
			letter-spacing: -0.01em;
			color: var(--ink);
		}
		:global(p) {
			margin-bottom: 16px;
		}
		:global(a) {
			color: var(--amber);
		}
	}
	.post-foot {
		padding: 24px 0;
		border-bottom: 1px solid var(--rule);
	}
	.back {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
		transition: color 0.15s;

		&:hover {
			color: var(--amber);
		}
	}
	.subscribe {
		padding: 40px 0;
		max-width: 48ch;
	}
	.subscribe-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 8px;
	}
	.subscribe p {
		font-size: 17px;
		color: var(--ink-dim);
		margin: 0 0 16px;
	}
</style>
