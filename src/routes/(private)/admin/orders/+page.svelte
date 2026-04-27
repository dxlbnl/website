<script lang="ts">
	import Led from '$lib/ui/Led.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: '2-digit'
		});
	}

	function fmtAmount(cents: number | null, currency: string | null) {
		if (cents == null) return '—';
		return new Intl.NumberFormat('nl-NL', {
			style: 'currency',
			currency: currency ?? 'EUR'
		}).format(cents / 100);
	}

	function statusTone(status: string): 'ok' | 'amber' | 'danger' {
		if (status === 'paid') return 'ok';
		if (status === 'failed') return 'danger';
		return 'amber';
	}

	function fmtAddress(
		name: string | null,
		addr: {
			line1: string;
			line2?: string | null;
			city: string;
			state?: string | null;
			postal_code: string;
			country: string;
		} | null
	) {
		if (!addr) return null;
		const lines = [
			name,
			addr.line1,
			addr.line2,
			[addr.postal_code, addr.city].filter(Boolean).join(' '),
			addr.country
		];
		return lines.filter(Boolean).join(', ');
	}
</script>

{#if !data.authed}
	<section class="hero">
		<div class="eyebrow">// ADMIN · ACCESS CONTROL</div>
		<h1>Authenticate.</h1>
		<p class="sub"><a href="/admin">Go to login →</a></p>
	</section>
{:else}
	<section class="hero">
		<div class="eyebrow">// ADMIN · ORDERS</div>
		<h1>Orders.</h1>
		<div class="meta">
			<span><b>{data.orders.length}</b> RECORDS</span>
		</div>
	</section>

	<section class="log">
		<div class="section-label">// LOG</div>
		{#each data.orders as order}
			<div class="entry">
				<span class="date">{fmtDate(order.createdAt)}</span>
				<div class="entry-body">
					<span class="product">{order.productId}</span>
					{#if order.customerEmail}
						<span class="email">{order.customerEmail}</span>
					{/if}
					{#if fmtAddress(order.shippingName, order.shippingAddress)}
						<span class="address">{fmtAddress(order.shippingName, order.shippingAddress)}</span>
					{/if}
				</div>
				<span class="amount">{fmtAmount(order.amountTotal, order.currency)}</span>
				<span class="status">
					<Led tone={statusTone(order.status)} />
					{order.status.toUpperCase()}
				</span>
			</div>
		{:else}
			<p class="empty">// NO RECORDS</p>
		{/each}
	</section>
{/if}

<style>
	.hero {
		padding: 32px 0;
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
		margin: 0;
	}
	.meta {
		display: flex;
		align-items: center;
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
	}
	.sub {
		margin-top: 20px;
		font-size: var(--t-lede);
		color: var(--ink-dim);
	}
	.section-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.14em;
		color: var(--ink-faint);
		padding: 28px 0 12px;
	}
	.entry {
		display: grid;
		grid-template-columns: 80px 1fr auto auto;
		gap: 20px;
		align-items: center;
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
	}
	.date {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--amber);
		letter-spacing: 0.06em;
	}
	.entry-body {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.product {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink);
		letter-spacing: 0.04em;
	}
	.email {
		font-size: var(--t-mono);
		color: var(--ink-dim);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.address {
		font-size: var(--t-mono);
		color: var(--ink-faint);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.amount {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink);
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		color: var(--ink-faint);
		white-space: nowrap;
	}
	.empty {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		padding: 20px 0;
		letter-spacing: 0.08em;
	}

	@media (max-width: 600px) {
		.entry {
			grid-template-columns: 72px 1fr;
			grid-template-rows: auto auto;
		}
		.amount,
		.status {
			grid-column: 2;
		}
	}
</style>
