<script lang="ts">
	import type { PageData } from './$types';
	import { calculateInvoice, formatDate, formatCurrencyWithLocale } from '$lib/invoice';

	let { data }: { data: PageData } = $props();
	let invoices = $derived(data.invoices);

	const getStatus = (vervaldatum: string) => {
		return new Date(vervaldatum) < new Date() ? '⚠️ Verlopen' : '✓ Actief';
	};
</script>

<div class="invoice-list">
	<header>
		<h1>FACTUREN [ALLEEN DEV]</h1>
		<p class="warning">Deze sectie is alleen zichtbaar in development modus</p>
	</header>

	<div class="table-wrapper">
		<table>
			<thead>
				<tr>
					<th>FACTUURNR</th>
					<th>Klant</th>
					<th>Datum</th>
					<th>Vervaldatum</th>
					<th>Subtotaal</th>
					<th>BTW</th>
					<th>Totaal</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				{#each invoices as factuur}
					{@const calc = calculateInvoice(factuur)}
					<tr>
						<td>
							<a href="/invoices/{factuur.factuurnr}/">{factuur.factuurnr}</a>
						</td>
						<td>{factuur.klant.naam}</td>
						<td>{formatDate(factuur.datum)}</td>
						<td>{formatDate(factuur.vervaldatum)}</td>
						<td>{formatCurrencyWithLocale(calc.subtotal)}</td>
						<td>
							{#if calc.hasMultipleRates}
								<span
									title={calc.vatBreakdown.map(([r, a]) => `${r}%: €${a.toFixed(2)}`).join('\n')}
								>
									{formatCurrencyWithLocale(calc.vatAmount)} *
								</span>
							{:else}
								{formatCurrencyWithLocale(calc.vatAmount)}
							{/if}
						</td>
						<td>{formatCurrencyWithLocale(calc.total)}</td>
						<td>
							{getStatus(factuur.vervaldatum)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.invoice-list {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 2rem;
		font-family: 'Inter', 'Helvetica Neue', sans-serif;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: 900;
		margin-bottom: 0.5rem;
		color: #eee;
	}

	.warning {
		color: #ff6b00;
		font-weight: bold;
		font-size: 0.9rem;
	}

	.table-wrapper {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		background: #111;
		color: #eee;
	}

	th {
		background: #222;
		padding: 1rem;
		text-align: left;
		font-weight: bold;
		border-bottom: 2px solid #00f0ff;
	}

	td {
		padding: 1rem;
		border-bottom: 1px solid #333;
	}

	a {
		color: #00f0ff;
		text-decoration: none;
		font-weight: bold;
	}

	a:hover {
		text-decoration: underline;
	}

	tbody tr:hover {
		background: #1a1a1a;
	}
</style>
