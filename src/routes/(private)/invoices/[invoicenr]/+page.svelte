<script lang="ts">
	import type { PageData } from './$types';
	import QRCode from 'qrcode';
	import { calculateInvoice, generateInvoicePDF } from '$lib/invoice';
	import { fmtCurrency, fmtDate, generatePaymentUrl } from '$lib/utils/fmt';

	let { data }: { data: PageData } = $props();
	let invoice = $derived(data.invoice);

	let calculations = $derived(calculateInvoice(invoice));
	let paymentUrl = $derived(generatePaymentUrl(calculations.total, invoice.factuurnr));

	let qrCanvas: HTMLCanvasElement;

	$effect(() => {
		if (qrCanvas && paymentUrl) {
			QRCode.toCanvas(qrCanvas, paymentUrl, {
				width: 120,
				margin: 1,
				color: { dark: '#14110b', light: '#efece4' }
			});
		}
	});

	const downloadPDF = async () => {
		const element = document.querySelector('.invoice-doc') as HTMLElement;
		if (!element) return;
		await generateInvoicePDF({ invoice, element });
	};
</script>

<button onclick={downloadPDF} class="dl-btn">DOWNLOAD PDF →</button>

<div class="invoice-doc" data-palette="paper">
	<!-- TOP RAIL -->
	<div class="rail top"></div>

	<div class="doc-body">
		<!-- HEADER -->
		<header class="doc-header">
			<div class="brand">{invoice.verzender.naam}</div>
			<div class="header-meta">
				<div class="meta-field">
					<span class="field-label">FACTUURNR</span>
					<span class="field-val">{invoice.factuurnr}</span>
				</div>
				<div class="meta-field">
					<span class="field-label">DATUM</span>
					<span class="field-val">{fmtDate(invoice.datum)}</span>
				</div>
			</div>
		</header>

		<!-- I/O -->
		<section class="io-row">
			<div class="address-block">
				<div class="block-label">// VERZENDER</div>
				<strong>{invoice.verzender.naam}</strong>
				{#each invoice.verzender.gegevens as line (line)}<div>{line}</div>{/each}
				<div class="reg-row">
					<span>KVK {invoice.verzender.kvk}</span>
					<span>BTW {invoice.verzender.btw}</span>
				</div>
			</div>

			<div class="arrow">→</div>

			<div class="address-block">
				<div class="block-label">// ONTVANGER</div>
				<strong>{invoice.klant.naam}</strong>
				{#each invoice.klant.adres as line (line)}<div>{line}</div>{/each}
			</div>
		</section>

		<!-- LINE ITEMS -->
		<section class="items-section">
			<div class="items-header-row">
				<div class="col-task">OMSCHRIJVING</div>
				<div class="col-num">AANTAL</div>
				<div class="col-num">TARIEF</div>
				<div class="col-num">TOTAAL</div>
			</div>

			{#each invoice.regels as regel (regel.omschrijving)}
				<div class="item-row">
					<div class="col-task">
						<span class="item-title">{regel.omschrijving}</span>
						{#if regel.toelichting}<span class="item-desc">{regel.toelichting}</span>{/if}
					</div>
					<div class="col-num">{regel.aantal}</div>
					<div class="col-num">{fmtCurrency(regel.tarief, invoice.valuta, invoice.taal)}</div>
					<div class="col-num">
						{fmtCurrency(regel.aantal * regel.tarief, invoice.valuta, invoice.taal)}
					</div>
				</div>
			{/each}
		</section>

		<!-- MASTER: PAYMENT + TOTALS -->
		<section class="master-row">
			<div class="payment-block">
				<div class="block-label">// BETALING</div>
				<div class="iban-name">{invoice.verzender.naam}</div>
				<div class="iban-nr">{invoice.verzender.iban}</div>
				<div class="payment-ref">
					Vermeld bij betaling: <strong>{invoice.factuurnr}</strong>
				</div>
				<div class="qr-wrap">
					<div class="block-label">// BETAAL VIA QR</div>
					<a
						href={paymentUrl}
						target="_blank"
						rel="external noopener noreferrer"
						aria-label="Betaal via QR-code"
					>
						<canvas bind:this={qrCanvas} class="qr-canvas"></canvas>
					</a>
				</div>
			</div>

			<div class="totals-block">
				<div class="calc-line">
					<span>SUBTOTAAL</span>
					<span>{fmtCurrency(calculations.subtotal, invoice.valuta, invoice.taal)}</span>
				</div>

				{#if invoice.btw_verlegd}
					<div class="calc-line">
						<span>BTW (0% - verlegd)</span>
						<span>{fmtCurrency(0, invoice.valuta, invoice.taal)}</span>
					</div>
				{:else if calculations.hasMultipleRates}
					{#each calculations.vatBreakdown as [rate, amount] (rate)}
						<div class="calc-line indent">
							<span>BTW ({rate}%)</span>
							<span>{fmtCurrency(amount, invoice.valuta, invoice.taal)}</span>
						</div>
					{/each}
					<div class="calc-line subtotal">
						<span>Totaal BTW</span>
						<span>{fmtCurrency(calculations.vatAmount, invoice.valuta, invoice.taal)}</span>
					</div>
				{:else}
					<div class="calc-line">
						<span>BTW ({calculations.vatBreakdown[0]?.[0] ?? 21}%)</span>
						<span>{fmtCurrency(calculations.vatAmount, invoice.valuta, invoice.taal)}</span>
					</div>
				{/if}

				<div class="total-line">
					<span>TE BETALEN</span>
					<span class="total-amount"
						>{fmtCurrency(calculations.total, invoice.valuta, invoice.taal)}</span
					>
				</div>
			</div>
		</section>

		<!-- FOOTER -->
		<footer class="doc-footer">
			{#if invoice.btw_verlegd}
				<p>** BTW VERLEGD VOLGENS ARTIKEL 12 WET OB **</p>
			{/if}
			<p>BETALING BINNEN 14 DAGEN NA FACTUURDATUM.</p>
		</footer>
	</div>

	<!-- BOTTOM RAIL -->
	<div class="rail bottom"></div>
</div>

<style>
	/* --- DOWNLOAD BUTTON --- */
	.dl-btn {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		padding: 10px 16px;
		background: var(--amber);
		color: var(--bg);
		border: none;
		cursor: pointer;
		text-transform: uppercase;
	}
	.dl-btn:hover {
		background: var(--ink);
		color: var(--bg);
	}

	@media print {
		.dl-btn {
			display: none;
		}
	}

	/* --- DOCUMENT SHELL --- */
	.invoice-doc {
		width: 210mm;
		min-height: 297mm;
		margin: 2rem auto;
		background: var(--bg);
		color: var(--ink);
		font-family: var(--mono);
		font-size: var(--t-mono);
		box-shadow: 0 4px 40px rgba(0, 0, 0, 0.3);
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	/* --- RACK RAILS --- */
	.rail {
		height: 14px;
		background:
			repeating-linear-gradient(
				90deg,
				var(--bg-rail) 0 18px,
				var(--rule-strong) 18px 19px,
				var(--bg-rail) 19px 40px
			),
			linear-gradient(var(--bg-sunken), var(--bg-rail));
		position: relative;
	}
	.rail.top {
		border-bottom: 1px solid var(--rule-strong);
	}
	.rail.bottom {
		border-top: 1px solid var(--rule-strong);
	}
	.rail::before,
	.rail::after {
		content: '';
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--bg-sunken);
		box-shadow: inset 0 0 0 1px var(--rule-strong);
	}
	.rail::before {
		left: 8px;
	}
	.rail::after {
		right: 8px;
	}

	/* --- DOC BODY --- */
	.doc-body {
		padding: 10mm 12mm 8mm;
		flex: 1;
	}

	/* --- HEADER --- */
	.doc-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding-bottom: 6mm;
		border-bottom: 2px solid var(--ink);
		margin-bottom: 6mm;
	}
	.brand {
		font-family: var(--sans);
		font-weight: 500;
		font-size: var(--t-h2);
		letter-spacing: -0.02em;
		line-height: 1;
		color: var(--ink);
	}
	.header-meta {
		display: flex;
		gap: 6mm;
		text-align: right;
	}
	.meta-field {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.field-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-dim);
	}
	.field-val {
		font-family: var(--mono);
		font-size: var(--t-mono);
		font-weight: 500;
		color: var(--ink);
		letter-spacing: 0.04em;
	}

	/* --- I/O ROW --- */
	.io-row {
		display: flex;
		align-items: flex-start;
		gap: 4mm;
		margin-bottom: 8mm;
	}
	.address-block {
		flex: 1;
		border: 1px solid var(--rule-strong);
		padding: 3mm 4mm;
		line-height: 1.55;
		font-size: var(--t-mono);
		position: relative;
	}
	.address-block strong {
		display: block;
		font-family: var(--sans);
		font-size: var(--t-body);
		font-weight: 500;
		letter-spacing: -0.01em;
		margin-bottom: 1mm;
	}
	.block-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--cyan);
		margin-bottom: 2mm;
	}
	.reg-row {
		margin-top: 3mm;
		font-size: var(--t-micro);
		letter-spacing: 0.06em;
		color: var(--ink-dim);
		display: flex;
		gap: 6mm;
	}
	.arrow {
		font-family: var(--mono);
		font-size: var(--t-lede);
		color: var(--ink-faint);
		align-self: center;
		padding: 0 2mm;
	}

	/* --- LINE ITEMS --- */
	.items-section {
		margin-bottom: 8mm;
		border-top: 1px solid var(--ink);
		border-bottom: 1px solid var(--rule-strong);
	}
	.items-header-row {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr 1fr;
		padding: 2mm 0;
		border-bottom: 1px solid var(--rule-strong);
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-dim);
	}
	.item-row {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr 1fr;
		padding: 3mm 0;
		border-bottom: 1px dashed var(--rule);
	}
	.item-row:last-child {
		border-bottom: none;
	}
	.col-task {
		padding-right: 4mm;
	}
	.col-num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.item-title {
		display: block;
		font-family: var(--sans);
		font-size: var(--t-body);
		font-weight: 500;
		letter-spacing: -0.01em;
		margin-bottom: 1mm;
	}
	.item-desc {
		display: block;
		font-size: var(--t-micro);
		color: var(--ink-dim);
		letter-spacing: 0.04em;
	}

	/* --- MASTER ROW --- */
	.master-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8mm;
		margin-bottom: 8mm;
	}
	.payment-block {
		flex: 1;
		border: 1px solid var(--rule-strong);
		padding: 3mm 4mm;
	}
	.payment-block .block-label {
		margin-bottom: 2mm;
	}
	.iban-name {
		font-family: var(--sans);
		font-weight: 500;
		font-size: var(--t-body);
		margin-bottom: 1mm;
	}
	.iban-nr {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		margin-bottom: 3mm;
	}
	.payment-ref {
		font-size: var(--t-micro);
		letter-spacing: 0.04em;
		color: var(--ink-dim);
		line-height: 1.5;
		padding-top: 2mm;
		border-top: 1px dashed var(--rule);
	}
	.payment-ref strong {
		color: var(--ink);
	}
	.qr-wrap {
		margin-top: 3mm;
		padding-top: 3mm;
		border-top: 1px dashed var(--rule);
	}
	.qr-canvas {
		display: block;
		margin-top: 2mm;
	}

	.totals-block {
		width: 55mm;
		flex-shrink: 0;
	}
	.calc-line {
		display: flex;
		justify-content: space-between;
		gap: 4mm;
		padding: 1.5mm 0;
		border-bottom: 1px dashed var(--rule);
		font-size: var(--t-mono);
		letter-spacing: 0.04em;
		font-variant-numeric: tabular-nums;
	}
	.calc-line.indent {
		padding-left: 4mm;
		font-size: var(--t-micro);
		color: var(--ink-dim);
	}
	.calc-line.subtotal {
		font-weight: 500;
		border-bottom: 1px solid var(--rule-strong);
	}
	.total-line {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 4mm;
		margin-top: 2mm;
		padding: 3mm;
		border: 1px solid var(--ink);
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.total-amount {
		font-size: var(--t-lede);
		font-weight: 500;
		color: var(--amber);
		letter-spacing: 0.02em;
		font-family: var(--mono);
	}

	/* --- FOOTER --- */
	.doc-footer {
		border-top: 1px dashed var(--rule);
		padding-top: 3mm;
		font-size: var(--t-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-dim);
		text-align: center;
		line-height: 1.8;
	}
	.doc-footer p {
		margin: 0;
	}

	/* --- PRINT --- */
	@media print {
		@page {
			size: A4;
			margin: 0;
		}

		:global(html),
		:global(body) {
			margin: 0 !important;
			padding: 0 !important;
		}

		.invoice-doc {
			width: 100% !important;
			max-width: 100% !important;
			min-height: auto;
			margin: 0 !important;
			box-shadow: none !important;
		}

		.doc-header,
		.io-row,
		.master-row,
		.payment-block,
		.totals-block {
			page-break-inside: avoid;
			break-inside: avoid;
		}
	}
</style>
