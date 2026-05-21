<script lang="ts">
	import { PageHero } from '@dxlbnl/ui'
	import { fmtDate, fmtDateTime } from '$lib/utils/fmt'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<PageHero eyebrow="// ADMIN · ANALYTICS" heading="Analytics." />

<section class="opens">
	<div class="section-label">// OPENS PER BROADCAST</div>
	{#each data.opens as row (row.broadcastId)}
		<div class="entry">
			<span class="slug">{row.slug}</span>
			<span class="date">{fmtDate(row.sentAt)}</span>
			<span class="opens-count">{row.uniqueOpens} / {row.recipientCount} OPENED</span>
			<span class="total">{row.totalOpens} TOTAL</span>
		</div>
	{:else}
		<p class="empty">// NO BROADCASTS SENT YET</p>
	{/each}
</section>

<section class="pageviews">
	<div class="section-label">// RECENT PAGEVIEWS</div>
	{#each data.pageviews as row (row.id)}
		<div class="entry">
			<span class="date">{fmtDateTime(row.visitedAt)}</span>
			<span class="path">{row.path}</span>
			<span class="referrer">{row.referrer ?? '—'}</span>
		</div>
	{:else}
		<p class="empty">// NO PAGEVIEWS RECORDED</p>
	{/each}
</section>

<style>
	.section-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.14em;
		color: var(--ink-faint);
		padding: 28px 0 12px;
	}
	.entry {
		display: grid;
		grid-template-columns: 160px 1fr auto auto;
		gap: 20px;
		align-items: center;
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
	}
	.slug {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink);
		letter-spacing: 0.04em;
	}
	.date {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--amber);
		letter-spacing: 0.06em;
	}
	.opens-count {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink);
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.total {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.path {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink);
		letter-spacing: 0.04em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.referrer {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.04em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.empty {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		padding: 20px 0;
		letter-spacing: 0.08em;
	}

	.pageviews .entry {
		grid-template-columns: 200px 1fr auto;
	}
</style>
