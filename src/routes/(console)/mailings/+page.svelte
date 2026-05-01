<script lang="ts">
	import type { MailingFrontmatter } from '$lib/types';
	import SEO from '$lib/ui/SEO.svelte';
	import { resolve } from '$app/paths';

	type Props = { data: { entries: MailingFrontmatter[] } };
	let { data }: Props = $props();
</script>

<SEO
	title="Mailings"
	description="Occasional updates from the lab — new builds, availability, notes from the bench."
/>

<div class="wrap">
	<section class="hero">
		<div class="eyebrow">// MAILINGS · FROM THE LAB</div>
		<h1>Mailings.</h1>
		<p class="sub">Occasional updates — new builds, availability, notes from the bench.</p>
		<div class="meta">
			<span><b>{data.entries.length}</b> ISSUES</span>
			{#if data.entries[0]}
				<span><b>LATEST</b> {data.entries[0].date.split('T')[0]}</span>
			{/if}
		</div>
	</section>

	{#each data.entries as entry, i (entry.slug)}
		<a href={resolve(`/mailings/${entry.slug}/`)} class="row">
			<div class="num">{String(i + 1).padStart(2, '0')}</div>
			<div class="body">
				{entry.title}
				<small>{entry.date.split('T')[0]} · {entry.subject}</small>
			</div>
		</a>
	{/each}
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
		font-size: clamp(48px, 8vw, 112px);
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0 0 16px;
	}
	.sub {
		font-size: var(--t-lede);
		color: var(--ink-dim);
		line-height: 1.55;
		max-width: 52ch;
	}
	.meta {
		display: flex;
		gap: 24px;
		margin-top: 20px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.meta b {
		color: var(--ink);
		font-weight: 500;
		margin-right: 4px;
	}
	.row {
		display: grid;
		grid-template-columns: 60px 1fr;
		gap: 32px;
		align-items: end;
		padding: 28px 0 24px;
		border-bottom: 1px solid var(--rule);
		color: inherit;
		transition: background 0.15s;

		@container (max-width: 720px) {
			grid-template-columns: 40px 1fr;
			gap: 16px;
		}

		&:hover {
			background: var(--bg-elev);
		}
	}
	.num {
		font-family: var(--mono);
		font-size: var(--t-h3);
		color: var(--ink-faint);
		letter-spacing: -0.02em;
	}
	.body {
		font-size: clamp(22px, 3.5vw, 40px);
		font-weight: 500;
		line-height: 1.1;
		letter-spacing: -0.02em;
	}
	.body small {
		display: block;
		font-family: var(--mono);
		font-size: var(--t-mono);
		font-weight: 400;
		color: var(--ink-dim);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		margin-top: 8px;
	}
</style>
