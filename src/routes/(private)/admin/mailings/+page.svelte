<script lang="ts">
	import { resolve } from '$app/paths';
	import { fmtDate } from '$lib/utils/fmt';
	import PageHero from '$lib/ui/PageHero.svelte';
	import type { PageData } from './$types';

	type Props = { data: PageData };
	let { data }: Props = $props();
</script>

<PageHero
	eyebrow="// ADMIN · MAILINGS"
	title="Mailings."
	sub="Send a mailing as a Resend Broadcast to your entire audience. Sent immediately — no undo."
>
	<div class="meta">
		<span><b>{data.mailings.length}</b> MAILINGS</span>
	</div>
</PageHero>

<section class="list">
	<div class="section-label">// ALL MAILINGS</div>
	{#each data.mailings as m (m.slug)}
		{@const stats = data.opensMap[m.slug]}
		{@const broadcast = data.broadcastsMap[m.slug]}
		<a class="row" href={resolve(`/admin/mailings/${m.slug}/`)}>
			<div class="row-meta">
				<span class="date">{fmtDate(m.date)}</span>
				<span class="published" class:live={!!broadcast}>{broadcast ? 'SENT' : 'DRAFT'}</span>
			</div>
			<div class="row-title">
				{m.title}
				<small>{m.subject}</small>
			</div>
			<div class="row-stats">
				{#if broadcast}
					<span class="stat-sent">{broadcast.recipientCount} SENT</span>
					<span class="stat-opens">{stats?.opens ?? 0} / {broadcast.recipientCount} OPENED</span>
				{/if}
			</div>
			<span class="row-arrow">→</span>
		</a>
	{/each}
</section>

<style>
	.meta {
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
	.section-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
		padding: 24px 0 12px;
	}
	.row {
		display: grid;
		grid-template-columns: 120px 1fr 120px auto;
		gap: 24px;
		align-items: center;
		padding: 16px 0;
		border-bottom: 1px solid var(--rule);
		text-decoration: none;
		color: inherit;
		transition: background 0.1s;

		@media (max-width: 600px) {
			grid-template-columns: 1fr;
			gap: 8px;
		}
	}
	.row:hover .row-title {
		color: var(--amber);
	}
	.row:hover .row-arrow {
		color: var(--amber);
	}
	.row-meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: var(--mono);
		font-size: var(--t-mono);
	}
	.date {
		color: var(--ink-dim);
		letter-spacing: 0.04em;
	}
	.published {
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.published.live {
		color: var(--ok);
	}
	.row-stats {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.stat-sent {
		color: var(--ink-dim);
	}
	.stat-opens {
		color: var(--amber);
	}
	.row-title {
		font-size: var(--t-body);
		font-weight: 500;
		letter-spacing: -0.01em;
		color: var(--ink);
		transition: color 0.15s;
	}
	.row-title small {
		display: block;
		font-family: var(--mono);
		font-size: var(--t-mono);
		font-weight: 400;
		color: var(--ink-dim);
		letter-spacing: 0.04em;
		margin-top: 4px;
	}
	.row-arrow {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		transition: color 0.15s;
		text-align: right;
	}
</style>
