<script lang="ts">
	import { resolve } from '$app/paths';
	import Led from '$lib/ui/Led.svelte';
	import { fmtDateTime, fmtCents } from '$lib/utils/fmt';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function statusTone(status: string): 'ok' | 'amber' | 'danger' {
		if (status === 'paid' || status === 'shipped' || status === 'delivered') return 'ok';
		if (status === 'failed' || status === 'cancelled') return 'danger';
		return 'amber';
	}

	let filterPayment = $state('all');
	let filterFulfillment = $state('all');
	let filterPreorder = $state('all');

	const filteredOrders = $derived(
		data.orders.filter((o) => {
			if (filterPayment !== 'all' && o.status !== filterPayment) return false;
			if (filterFulfillment !== 'all' && o.fulfillmentStatus !== filterFulfillment) return false;
			if (filterPreorder !== 'all') {
				const isPre = filterPreorder === 'yes';
				if (o.isPreorder !== isPre) return false;
			}
			return true;
		})
	);

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
		<p class="sub"><a href={resolve('/admin/')}>Go to login →</a></p>
	</section>
{:else}
	<section class="hero">
		<div class="eyebrow">// ADMIN · ORDERS</div>
		<h1>Orders.</h1>
		<div class="meta">
			<span><b>{data.orders.length}</b> RECORDS</span>
			{#if filteredOrders.length !== data.orders.length}
				<span><b>{filteredOrders.length}</b> FILTERED</span>
			{/if}
		</div>
	</section>

	<section class="filters">
		<div class="filter-group">
			<label for="payment">Payment</label>
			<select id="payment" bind:value={filterPayment}>
				<option value="all">All</option>
				<option value="paid">Paid</option>
				<option value="pending">Pending</option>
				<option value="failed">Failed</option>
			</select>
		</div>
		<div class="filter-group">
			<label for="fulfillment">Fulfillment</label>
			<select id="fulfillment" bind:value={filterFulfillment}>
				<option value="all">All</option>
				<option value="unfulfilled">Unfulfilled</option>
				<option value="shipped">Shipped</option>
				<option value="delivered">Delivered</option>
				<option value="cancelled">Cancelled</option>
			</select>
		</div>
		<div class="filter-group">
			<label for="preorder">Pre-order</label>
			<select id="preorder" bind:value={filterPreorder}>
				<option value="all">All</option>
				<option value="yes">Yes</option>
				<option value="no">No</option>
			</select>
		</div>
	</section>

	<section class="log">
		<div class="section-label">// LOG</div>
		{#each filteredOrders as order (order.id)}
			<div class="entry">
				<span class="date">{fmtDateTime(order.createdAt)}</span>
				<div class="entry-body">
					<span class="product">
						{order.productId}
						{#if order.isPreorder}
							<span class="tag">PREORDER</span>
						{/if}
					</span>
					{#if order.customerEmail}
						<span class="email">{order.customerEmail}</span>
					{/if}
					{#if fmtAddress(order.shippingName, order.shippingAddress)}
						<span class="address">{fmtAddress(order.shippingName, order.shippingAddress)}</span>
					{/if}
				</div>
				<span class="amount">{fmtCents(order.amountTotal, order.currency)}</span>
				<div class="statuses">
					<span class="status">
						<Led tone={statusTone(order.status)} />
						{order.status.toUpperCase()}
					</span>
					<span class="status">
						<Led tone={statusTone(order.fulfillmentStatus)} />
						{order.fulfillmentStatus.toUpperCase()}
					</span>
				</div>
			</div>
		{:else}
			<p class="empty">// NO RECORDS FOUND</p>
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
		font-size: var(--t-hero);
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
	.filters {
		display: flex;
		gap: 32px;
		padding: 24px 0;
		border-bottom: 1px solid var(--rule);
		flex-wrap: wrap;
	}
	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.filter-group label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.filter-group select {
		background: var(--paper);
		border: 1px solid var(--rule);
		color: var(--ink);
		padding: 6px 12px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		border-radius: 4px;
		outline: none;
	}
	.filter-group select:focus {
		border-color: var(--amber);
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
		grid-template-columns: 160px 1fr auto auto;
		gap: 20px;
		align-items: center;
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
	}
	.statuses {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 120px;
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
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.tag {
		font-size: var(--t-micro);
		background: var(--amber);
		color: var(--paper);
		padding: 2px 6px;
		border-radius: 2px;
		letter-spacing: 0.08em;
		font-weight: 600;
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
