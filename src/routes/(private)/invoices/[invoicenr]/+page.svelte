<script lang="ts">
	import type { PageData } from './$types';
	import QRCode from 'qrcode';
	import Panel from '$lib/ui/Panel.svelte';
	import CrtOverlay from '$lib/ui/Overlay.svelte';
	import {
		calculateInvoice,
		formatCurrency,
		formatDate,
		generatePaymentUrl,
		generateInvoicePDF
	} from '$lib/invoice';

	let { data }: { data: PageData } = $props();
	let invoice = $derived(data.invoice);

	// Calculations (reactive)
	let calculations = $derived(calculateInvoice(invoice));
	let paymentUrl = $derived(generatePaymentUrl(calculations.total, invoice.factuurnr));

	// Formatter bound to invoice locale
	const fmt = (n: number) => formatCurrency(n, invoice);

	// QR Code generation
	let qrCanvas: HTMLCanvasElement;

	$effect(() => {
		if (qrCanvas && paymentUrl) {
			QRCode.toCanvas(qrCanvas, paymentUrl, {
				width: 200,
				margin: 2,
				color: {
					dark: '#000000',
					light: '#ffffff'
				}
			});
		}
	});

	// PDF download handler
	const downloadPDF = async () => {
		const element = document.querySelector('.faceplate') as HTMLElement;
		if (!element) return;

		await generateInvoicePDF({ invoice, element });
	};
</script>

<button onclick={downloadPDF} class="cyan pdf-download-btn">Download PDF</button>

<div class="faceplate">
	<CrtOverlay />

	<!-- RACK MOUNT SCREWS (Decorative) -->
	<div class="screw tl">⊕</div>
	<div class="screw tr">⊕</div>
	<div class="screw bl">⊕</div>
	<div class="screw br">⊕</div>

	<!-- HEADER ITEM (unbreakable) -->
	<div class="item">
		<!-- SECTION 1: THE IDENTIFIER (Top Module) -->
		<header class="panel-header">
			<h1 class="brand-name">{invoice.verzender.naam}</h1>
			<div class="panel-meta">
				<div class="meta-box">
					<label>FACTUURNR</label>
					<span>{invoice.factuurnr}</span>
				</div>
				<div class="meta-box">
					<label>DATUM</label>
					<span>{formatDate(invoice.datum)}</span>
				</div>
			</div>
		</header>

		<!-- SECTION 2: THE PATCH (I/O) -->
		<section class="io-grid">
			<Panel label="VERZENDER">
				<strong>{invoice.verzender.naam}</strong>
				{#each invoice.verzender.gegevens as line}<div>{line}</div>{/each}
				<div class="reg-info">
					<span>KVK {invoice.verzender.kvk}</span>
					<span>BTW {invoice.verzender.btw}</span>
				</div>
			</Panel>

			<div class="arrow-block">➔</div>

			<Panel label="ONTVANGER">
				<strong>{invoice.klant.naam}</strong>
				{#each invoice.klant.adres as line}<div>{line}</div>{/each}
			</Panel>
		</section>

		<!-- SECTION 3: THE PROCESS LOG (Line Items) -->
		<div class="module-divider">WERKZAAMHEDEN</div>
	</div>

	<div class="grid-table">
		<div class="row header">
			<div class="col task">OMSCHRIJVING</div>
			<div class="col qty">AANTAL</div>
			<div class="col rate">TARIEF</div>
			<div class="col total">TOTAAL</div>
		</div>

		{#each invoice.regels as regel}
			<div class="row item">
				<div class="col task">
					<span class="task-title">{regel.omschrijving}</span>
					<span class="task-desc">{regel.toelichting}</span>
				</div>
				<div class="col qty">{regel.aantal}</div>
				<div class="col rate">{fmt(regel.tarief)}</div>
				<div class="col total">{fmt(regel.aantal * regel.tarief)}</div>
			</div>
		{/each}
	</div>

	<!-- FOOTER ITEM (unbreakable) -->
	<div class="item">
		<!-- SECTION 4: MASTER OUTPUT (Totals) -->
		<div class="master-section">
			<div class="payment-block">
				<div class="port-label">BETALING</div>
				<div class="payment-content">
					<div class="payment-method">
						<strong>IBAN</strong>
						<div class="iban-display">{invoice.verzender.naam}</div>
						<div class="iban-display">{invoice.verzender.iban}</div>
					</div>
					<div class="payment-instructions">
						Vermeld bij de betaling: <strong>{invoice.factuurnr}</strong>
					</div>
					<div class="payment-qr">
						<strong>BETAAL VIA QR</strong>
						<a href={paymentUrl} target="_blank" rel="noopener noreferrer" class="qr-link">
							<canvas bind:this={qrCanvas} class="qr-canvas"></canvas>
						</a>
					</div>
				</div>
			</div>

			<div class="total-block">
				<div class="calc-row">
					<span>SUBTOTAAL</span>
					<span>{fmt(calculations.subtotal)}</span>
				</div>
				<!-- BTW Display: Show breakdown if multiple rates, otherwise single line -->
				{#if invoice.btw_verlegd}
					<div class="calc-row">
						<span>BTW (0% - verlegd)</span>
						<span>{fmt(0)}</span>
					</div>
				{:else if calculations.hasMultipleRates}
					<!-- Show breakdown when multiple rates are present -->
					{#each calculations.vatBreakdown as [rate, amount]}
						<div class="calc-row btw-breakdown">
							<span>BTW ({rate}%)</span>
							<span>{fmt(amount)}</span>
						</div>
					{/each}
					<div class="calc-row btw-total">
						<span>Totaal BTW</span>
						<span>{fmt(calculations.vatAmount)}</span>
					</div>
				{:else}
					<!-- Single BTW rate -->
					<div class="calc-row">
						<span>BTW ({calculations.vatBreakdown[0]?.[0] ?? 21}%)</span>
						<span>{fmt(calculations.vatAmount)}</span>
					</div>
				{/if}
				<div class="final-output">
					<label>TE BETALEN</label>
					<span class="value">{fmt(calculations.total)}</span>
				</div>
			</div>
		</div>

		<!-- FOOTER -->
		<footer class="panel-footer">
			{#if invoice.btw_verlegd}
				<p>** BTW VERLEGD VOLGENS ARTIKEL 12 WET OB **</p>
			{/if}
			<p>BETALING BINNEN 14 DAGEN.</p>
		</footer>
	</div>
</div>

<style>
	/* --- VARS --- */
	:root {
		--bg: #111;
		--ink: #eee;
		--accent: #00f0ff; /* Cyan */
		--line: #333;
		--font-head: 'Inter', 'Helvetica Neue', sans-serif;
		--font-mono: 'JetBrains Mono', monospace;
	}

	/* --- PRINT MODE --- */
	@media print {
		:root {
			--bg: #fff;
			--ink: #000;
			--accent: #000;
			--line: #000;
		}

		@page {
			size: A4;
			margin: 0;
		}

		* {
			box-shadow: none !important;
		}

		html,
		body {
			margin: 0 !important;
			padding: 0 !important;
		}

		.faceplate {
			width: 100% !important;
			max-width: 100% !important;
			min-height: auto;
			margin: 0 !important;
			padding: 20mm 15mm 15mm 15mm !important;
			border: none;
		}

		.faceplate,
		.panel-header,
		.io-grid,
		.master-section {
			margin: 0 !important;
		}

		.panel-header,
		.io-grid,
		.master-section,
		.payment-block,
		.total-block,
		.panel-footer,
		.grid-table .row {
			page-break-inside: avoid;
			break-inside: avoid;
			orphans: 3;
			widows: 3;
		}

		.panel-header {
			border-bottom: 2px solid #000 !important;
			margin-bottom: 1rem !important;
		}

		.port,
		.payment-block,
		.final-output {
			border-color: #000 !important;
		}

		.port-label {
			background: #fff !important;
		}

		.qr-canvas {
			border: 1px solid #000;
		}

		.arrow-block {
			color: #000 !important;
		}

		.screw {
			display: none;
		}

		a {
			text-decoration: none;
			color: #000;
		}
	}

	/* --- LAYOUT --- */
	.faceplate {
		background: var(--bg);
		color: var(--ink);
		font-family: var(--font-mono);
		width: 210mm;
		min-height: 297mm;
		padding: 10mm;
		margin: 2rem auto;
		position: relative;
		box-sizing: border-box;
		box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
		border: 1px solid var(--line);
	}

	/* SCREWS */
	.screw {
		position: absolute;
		font-size: 1.5rem;
		color: #444;
	}
	.tl {
		top: 10px;
		left: 10px;
	}
	.tr {
		top: 10px;
		right: 10px;
	}
	.bl {
		bottom: 10px;
		left: 10px;
	}
	.br {
		bottom: 10px;
		right: 10px;
	}

	/* HEADER */
	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 3px solid var(--ink); /* Heavy Divider */
		padding-bottom: 1rem;
		margin-bottom: 1.5rem;
	}
	.brand-name {
		font-weight: 900;
		font-size: clamp(2rem, 6vw, 3rem);
		margin: 0;
		color: var(--text-main);
		text-shadow:
			2px 0 var(--cyber-red),
			-2px 0 var(--cyber-cyan);
	}
	.panel-meta {
		display: flex;
		gap: 1.5rem;
		text-align: right;
	}
	.meta-box label {
		display: block;
		font-size: 0.5rem;
		color: var(--cyber-cyan);
		margin-bottom: 0.15rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}
	.meta-box span {
		font-size: 0.9rem;
		font-weight: bold;
	}

	/* I/O GRID */
	.io-grid {
		display: flex;
		align-items: flex-start;
		margin-bottom: 2rem;
		gap: 0.75rem;
	}

	.io-grid :global(.panel) {
		flex: 1;
	}

	.port {
		flex: 1;
		border: 1px solid var(--line);
		padding: 0.75rem;
		position: relative;
	}
	.port-label {
		position: absolute;
		top: -8px;
		left: 8px;
		background: var(--bg);
		padding: 0 4px;
		font-size: 0.55rem;
		color: var(--cyber-cyan);
		font-weight: bold;
	}
	.port-content {
		line-height: 1.3;
		font-size: 0.7rem;
	}
	.port-content strong {
		display: block;
		font-size: 0.85rem;
		margin-bottom: 0.4rem;
		font-family: var(--font-head);
	}
	.reg-info {
		margin-top: 0.75rem;
		font-size: 0.55rem;
		opacity: 0.7;
	}
	.reg-info span {
		display: block;
	}

	.arrow-block {
		font-size: 1.5rem;
		color: var(--line);
	}

	/* TABLE */
	.module-divider {
		background: var(--line);
		color: var(--bg);
		font-weight: bold;
		padding: 0.15rem 0.4rem;
		font-size: 0.6rem;
		margin-bottom: 0.75rem;
		display: inline-block;
	}

	.grid-table {
		margin-bottom: 2rem;
		border-top: 2px solid var(--ink);
	}
	.row {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr 1fr;
		border-bottom: 1px solid var(--line);
	}
	.row.header {
		font-weight: bold;
		font-size: 0.55rem;
		color: var(--cyber-cyan);
		padding: 0.4rem 0;
	}
	.row.item {
		padding: 0.7rem 0;
	}

	.col {
		padding: 0 0.4rem;
	}
	.col.qty,
	.col.rate,
	.col.total {
		text-align: right;
	}

	.task-title {
		display: block;
		font-weight: bold;
		font-size: 0.75rem;
		margin-bottom: 0.15rem;
	}
	.task-desc {
		display: block;
		font-size: 0.6rem;
		opacity: 0.7;
	}

	/* MASTER OUTPUT */
	.master-section {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 0.75rem;
	}

	.payment-block {
		border: 2px solid var(--line);
		padding: 1rem;
		position: relative;
		flex: 1;
	}

	.payment-content {
		display: block;
	}

	.payment-method {
		margin-bottom: 0.75rem;
	}

	.payment-method strong {
		display: block;
		font-size: 0.55rem;
		color: var(--cyber-cyan);
		margin-bottom: 0.25rem;
	}

	.iban-display {
		font-size: 0.8rem;
		font-weight: bold;
		letter-spacing: 0.5px;
	}

	.payment-instructions {
		font-size: 0.6rem;
		opacity: 0.8;
		line-height: 1.3;
		margin-bottom: 1rem;
	}

	.payment-instructions strong {
		color: var(--cyber-cyan);
	}

	.payment-qr {
		margin-top: 0.75rem;
	}

	.payment-qr strong {
		display: block;
		font-size: 0.55rem;
		color: var(--cyber-cyan);
		margin-bottom: 0.4rem;
	}

	.qr-link {
		display: inline-block;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.qr-link:hover {
		transform: scale(1.05);
	}

	.qr-canvas {
		display: block;
		background: white;
		padding: 0.4rem;
		border-radius: 3px;
	}

	.total-block {
		width: 220px;
	}
	.calc-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.4rem;
		font-size: 0.7rem;
	}

	.final-output {
		margin-top: 0.75rem;
		border: 2px solid var(--ink);
		padding: 0.75rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.final-output label {
		font-size: 0.6rem;
		font-weight: bold;
	}
	.final-output .value {
		font-size: 1.1rem;
		font-weight: bold;
		color: var(--cyber-cyan);
	}

	/* FOOTER */
	.panel-footer {
		margin-top: 2.5rem;
		border-top: 1px dashed var(--line);
		padding-top: 0.75rem;
		font-size: 0.55rem;
		text-align: center;
		opacity: 0.6;
	}

	.calc-row.btw-breakdown {
		font-size: 0.65rem;
		opacity: 0.9;
		padding-left: 0.75rem;
	}

	.calc-row.btw-total {
		font-weight: bold;
		border-top: 1px solid var(--line);
		padding-top: 0.4rem;
		margin-top: 0.2rem;
	}

	/* PDF Download Button Positioning */
	.pdf-download-btn {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
	}

	@media print {
		.pdf-download-btn {
			display: none;
		}
	}
</style>
