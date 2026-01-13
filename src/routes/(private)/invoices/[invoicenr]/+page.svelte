<script lang="ts">
	import type { PageData } from './$types';
	import QRCode from 'qrcode';
	import html2canvas from 'html2canvas';
	import jsPDF from 'jspdf';

	let { data }: { data: PageData } = $props();
	let invoice = $derived(data.invoice);

	const fmt = (n: number) =>
		new Intl.NumberFormat(invoice.taal || 'nl-NL', {
			style: 'currency',
			currency: invoice.valuta || 'EUR'
		}).format(n);

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString('nl-NL', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit'
		});

	// Calculate subtotal (sum of all line items excluding BTW)
	let subtotaal = $derived(
		invoice.regels.reduce((sum, regel) => sum + regel.aantal * regel.tarief, 0)
	);

	// Group BTW amounts by rate (calculate breakdown first)
	let btwBreakdown = $derived.by(() => {
		if (invoice.btw_verlegd) {
			return [];
		}

		const breakdown = new Map<number, number>();

		invoice.regels.forEach((regel) => {
			const lijnTotaal = regel.aantal * regel.tarief;
			const btwPercentage = regel.btw_tarief ?? 21; // Default to 21%
			const lijnBtw = lijnTotaal * (btwPercentage / 100);

			breakdown.set(btwPercentage, (breakdown.get(btwPercentage) || 0) + lijnBtw);
		});

		return Array.from(breakdown.entries()).sort((a, b) => b[0] - a[0]); // Sort by rate descending
	});

	// Calculate total BTW from breakdown
	let btwBedrag = $derived(
		invoice.btw_verlegd ? 0 : btwBreakdown.reduce((sum, [_, amount]) => sum + amount, 0)
	);

	// Check if multiple rates are used
	let hasMultipleRates = $derived(btwBreakdown.length > 1);

	// Total = Subtotal + BTW
	let totaal = $derived(subtotaal + btwBedrag);

	// QR Code generation
	let qrCanvas: HTMLCanvasElement;
	let paymentUrl = $derived(
		`https://bunq.me/dexterlabs/${totaal.toFixed(2)}/${encodeURIComponent(`Factuur ${invoice.factuurnr}`)}`
	);

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

	// PDF download function with proper pagination
	const downloadPDF = async () => {
		const element = document.querySelector('.faceplate') as HTMLElement;
		if (!element) return;

		// Create PDF
		const pdf = new jsPDF('p', 'mm', 'a4');
		const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
		const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

		// Measure elements directly from the page
		const header = element.querySelector('.panel-header') as HTMLElement;
		const ioGrid = element.querySelector('.io-grid') as HTMLElement;
		const divider = element.querySelector('.module-divider') as HTMLElement;
		const tableHeader = element.querySelector('.grid-table .row.header') as HTMLElement;
		const masterSection = element.querySelector('.master-section') as HTMLElement;
		const footer = element.querySelector('.panel-footer') as HTMLElement;
		const firstLineItem = element.querySelector('.grid-table .row.item') as HTMLElement;

		// Get pixel heights
		const fixedHeaderHeightPx =
			(header?.offsetHeight || 0) +
			(ioGrid?.offsetHeight || 0) +
			(divider?.offsetHeight || 0) +
			(tableHeader?.offsetHeight || 0);

		const footerHeightPx = (masterSection?.offsetHeight || 0) + (footer?.offsetHeight || 0);
		const lineItemHeightPx = firstLineItem?.offsetHeight || 0;

		// Convert pixel heights to mm (based on element width to PDF width ratio)
		const elementWidthPx = element.offsetWidth;
		const pxToMmRatio = pdfWidth / elementWidthPx;

		const fixedHeaderHeightMm = fixedHeaderHeightPx * pxToMmRatio;
		const footerHeightMm = footerHeightPx * pxToMmRatio;
		const lineItemHeightMm = lineItemHeightPx * pxToMmRatio;
		const tableHeaderHeightMm = (tableHeader?.offsetHeight || 0) * pxToMmRatio;

		// Calculate available space for line items (with minimal padding)
		const padding = 5; // mm
		const firstPageAvailableMm = pdfHeight - fixedHeaderHeightMm - footerHeightMm - padding;
		const otherPageAvailableMm = pdfHeight - tableHeaderHeightMm - footerHeightMm - padding;

		const firstPageItems = Math.max(1, Math.floor(firstPageAvailableMm / lineItemHeightMm));
		const otherPageItems = Math.max(1, Math.floor(otherPageAvailableMm / lineItemHeightMm));

		// Split line items into pages
		const pages: number[][] = [];
		let remainingItems = invoice.regels.length;
		let currentIndex = 0;

		// First page
		const firstPageCount = Math.min(firstPageItems, remainingItems);
		pages.push(Array.from({ length: firstPageCount }, (_, i) => i));
		currentIndex += firstPageCount;
		remainingItems -= firstPageCount;

		// Subsequent pages
		while (remainingItems > 0) {
			const itemsThisPage = Math.min(otherPageItems, remainingItems);
			pages.push(Array.from({ length: itemsThisPage }, (_, i) => currentIndex + i));
			currentIndex += itemsThisPage;
			remainingItems -= itemsThisPage;
		}

		// Render each page
		for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
			const isFirstPage = pageIdx === 0;
			const isLastPage = pageIdx === pages.length - 1;
			const itemIndices = pages[pageIdx];

			// Clone and modify invoice for this page
			const pageClone = element.cloneNode(true) as HTMLElement;
			pageClone.style.position = 'absolute';
			pageClone.style.left = '-9999px';
			pageClone.style.width = element.offsetWidth + 'px';
			document.body.appendChild(pageClone);

			// Remove header on non-first pages
			if (!isFirstPage) {
				const headerToRemove = pageClone.querySelector('.panel-header');
				const ioGridToRemove = pageClone.querySelector('.io-grid');
				headerToRemove?.remove();
				ioGridToRemove?.remove();
			}

			// Remove footer on non-last pages
			if (!isLastPage) {
				const masterToRemove = pageClone.querySelector('.master-section');
				const footerToRemove = pageClone.querySelector('.panel-footer');
				masterToRemove?.remove();
				footerToRemove?.remove();
			}

			// Filter line items for this page
			const lineItemsContainer = pageClone.querySelector('.grid-table');
			if (lineItemsContainer) {
				const allItems = Array.from(lineItemsContainer.querySelectorAll('.row.item'));
				allItems.forEach((item, idx) => {
					if (!itemIndices.includes(idx)) {
						item.remove();
					}
				});
			}

			// Wait for render
			await new Promise((resolve) => setTimeout(resolve, 100));

			// Capture this page
			const canvas = await html2canvas(pageClone, {
				scale: 3,
				useCORS: true,
				backgroundColor: null,
				logging: false
			});

			document.body.removeChild(pageClone);

			// Add to PDF
			if (pageIdx > 0) {
				pdf.addPage();
			}

			const imgData = canvas.toDataURL('image/png');
			const imgWidth = pdfWidth;
			const imgHeight = (canvas.height * pdfWidth) / canvas.width;

			// Fit to page height if needed
			if (imgHeight > pdfHeight) {
				const scaledHeight = pdfHeight;
				const scaledWidth = (canvas.width * pdfHeight) / canvas.height;
				pdf.addImage(imgData, 'PNG', 0, 0, scaledWidth, scaledHeight);
			} else {
				pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
			}
		}

		// Download
		pdf.save(`factuur-${invoice.factuurnr}.pdf`);
	};
</script>

<button onclick={downloadPDF} class="pdf-button"> 📄 Download PDF </button>

<div class="faceplate">
	<!-- RACK MOUNT SCREWS (Decorative) -->
	<div class="screw tl">⊕</div>
	<div class="screw tr">⊕</div>
	<div class="screw bl">⊕</div>
	<div class="screw br">⊕</div>

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
		<div class="port out">
			<div class="port-label">[ VERZENDER ]</div>
			<div class="port-content">
				<strong>{invoice.verzender.naam}</strong>
				{#each invoice.verzender.gegevens as line}<div>{line}</div>{/each}
				<div class="reg-info">
					<span>KVK {invoice.verzender.kvk}</span>
					<span>BTW {invoice.verzender.btw}</span>
				</div>
			</div>
		</div>

		<div class="arrow-block">➔</div>

		<div class="port in">
			<div class="port-label">[ ONTVANGER ]</div>
			<div class="port-content">
				<strong>{invoice.klant.naam}</strong>
				{#each invoice.klant.adres as line}<div>{line}</div>{/each}
			</div>
		</div>
	</section>

	<!-- SECTION 3: THE PROCESS LOG (Line Items) -->
	<div class="module-divider">WERKZAAMHEDEN</div>

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

	<!-- SECTION 4: MASTER OUTPUT (Totals) -->
	<div class="master-section">
		<div class="payment-block">
			<div class="port-label">BETALING</div>
			<div class="payment-content">
				<div class="payment-method">
					<strong>IBAN</strong>
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
				<span>{fmt(subtotaal)}</span>
			</div>
			<!-- BTW Display: Show breakdown if multiple rates, otherwise single line -->
			{#if invoice.btw_verlegd}
				<div class="calc-row">
					<span>BTW (0% - verlegd)</span>
					<span>{fmt(0)}</span>
				</div>
			{:else if hasMultipleRates}
				<!-- Show breakdown when multiple rates are present -->
				{#each btwBreakdown as [rate, amount]}
					<div class="calc-row btw-breakdown">
						<span>BTW ({rate}%)</span>
						<span>{fmt(amount)}</span>
					</div>
				{/each}
				<div class="calc-row btw-total">
					<span>Totaal BTW</span>
					<span>{fmt(btwBedrag)}</span>
				</div>
			{:else}
				<!-- Single BTW rate -->
				<div class="calc-row">
					<span>BTW ({btwBreakdown[0]?.[0] ?? 21}%)</span>
					<span>{fmt(btwBedrag)}</span>
				</div>
			{/if}
			<div class="final-output">
				<label>TE BETALEN</label>
				<span class="value">{fmt(totaal)}</span>
			</div>
		</div>
	</div>

	<!-- FOOTER -->
	<footer class="panel-footer">
		{#if invoice.btw_verlegd}
			<p>** BTW VERLEGD VOLGENS ARTIKEL 12 WET OB **</p>
		{/if}
		<p>BETALING BINNEN 14 DAGEN. DEXTERLABS IS EEN GEREGISTREERD HANDELSMERK.</p>
	</footer>
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
		padding: 15mm;
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
		border-bottom: 4px solid var(--ink); /* Heavy Divider */
		padding-bottom: 1.5rem;
		margin-bottom: 2rem;
	}
	.brand-name {
		font-family: var(--font-head);
		font-weight: 900;
		font-size: 3rem;
		margin: 0;
		letter-spacing: -2px;
		line-height: 0.8;
	}
	.panel-meta {
		display: flex;
		gap: 2rem;
		text-align: right;
	}
	.meta-box label {
		display: block;
		font-size: 0.6rem;
		color: var(--accent);
		margin-bottom: 0.2rem;
	}
	.meta-box span {
		font-size: 1.2rem;
		font-weight: bold;
	}

	/* I/O GRID */
	.io-grid {
		display: flex;
		align-items: flex-start;
		margin-bottom: 3rem;
		gap: 1rem;
	}
	.port {
		flex: 1;
		border: 1px solid var(--line);
		padding: 1rem;
		position: relative;
	}
	.port-label {
		position: absolute;
		top: -10px;
		left: 10px;
		background: var(--bg);
		padding: 0 5px;
		font-size: 0.7rem;
		color: var(--accent);
		font-weight: bold;
	}
	.port-content {
		line-height: 1.4;
		font-size: 0.9rem;
	}
	.port-content strong {
		display: block;
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
		font-family: var(--font-head);
	}
	.reg-info {
		margin-top: 1rem;
		font-size: 0.7rem;
		opacity: 0.7;
	}
	.reg-info span {
		display: block;
	}

	.arrow-block {
		font-size: 2rem;
		color: var(--line);
	}

	/* TABLE */
	.module-divider {
		background: var(--line);
		color: var(--bg);
		font-weight: bold;
		padding: 0.2rem 0.5rem;
		font-size: 0.8rem;
		margin-bottom: 1rem;
		display: inline-block;
	}

	.grid-table {
		margin-bottom: 3rem;
		border-top: 2px solid var(--ink);
	}
	.row {
		display: grid;
		grid-template-columns: 3fr 1fr 1fr 1fr;
		border-bottom: 1px solid var(--line);
	}
	.row.header {
		font-weight: bold;
		font-size: 0.7rem;
		color: var(--accent);
		padding: 0.5rem 0;
	}
	.row.item {
		padding: 1rem 0;
	}

	.col {
		padding: 0 0.5rem;
	}
	.col.qty,
	.col.rate,
	.col.total {
		text-align: right;
	}

	.task-title {
		display: block;
		font-weight: bold;
		font-size: 1rem;
		margin-bottom: 0.2rem;
	}
	.task-desc {
		display: block;
		font-size: 0.8rem;
		opacity: 0.7;
	}

	/* MASTER OUTPUT */
	.master-section {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 1rem;
	}

	.payment-block {
		border: 2px solid var(--line);
		padding: 1.5rem;
		position: relative;
		flex: 1;
	}

	.payment-content {
		display: block;
	}

	.payment-method {
		margin-bottom: 1rem;
	}

	.payment-method strong {
		display: block;
		font-size: 0.7rem;
		color: var(--accent);
		margin-bottom: 0.3rem;
	}

	.iban-display {
		font-size: 1.1rem;
		font-weight: bold;
		letter-spacing: 1px;
	}

	.payment-instructions {
		font-size: 0.8rem;
		opacity: 0.8;
		line-height: 1.4;
		margin-bottom: 1.5rem;
	}

	.payment-instructions strong {
		color: var(--accent);
	}

	.payment-qr {
		margin-top: 1rem;
	}

	.payment-qr strong {
		display: block;
		font-size: 0.7rem;
		color: var(--accent);
		margin-bottom: 0.5rem;
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
		padding: 0.5rem;
		border-radius: 4px;
	}

	.total-block {
		width: 300px;
	}
	.calc-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	.final-output {
		margin-top: 1rem;
		border: 2px solid var(--ink);
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.final-output label {
		font-size: 0.8rem;
		font-weight: bold;
	}
	.final-output .value {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--accent);
	}

	/* FOOTER */
	.panel-footer {
		margin-top: 4rem;
		border-top: 1px dashed var(--line);
		padding-top: 1rem;
		font-size: 0.7rem;
		text-align: center;
		opacity: 0.6;
	}

	.calc-row.btw-breakdown {
		font-size: 0.85rem;
		opacity: 0.9;
		padding-left: 1rem;
	}

	.calc-row.btw-total {
		font-weight: bold;
		border-top: 1px solid var(--line);
		padding-top: 0.5rem;
		margin-top: 0.25rem;
	}

	/* PDF Download Button */
	.pdf-button {
		position: fixed;
		top: 20px;
		right: 20px;
		padding: 0.75rem 1.5rem;
		background: var(--accent);
		color: var(--bg);
		border: none;
		border-radius: 4px;
		font-family: var(--font-mono);
		font-weight: bold;
		font-size: 0.9rem;
		cursor: pointer;
		z-index: 1000;
		box-shadow: 0 2px 8px rgba(0, 240, 255, 0.3);
		transition: all 0.2s ease;
	}

	.pdf-button:hover {
		background: #00d4e0;
		box-shadow: 0 4px 12px rgba(0, 240, 255, 0.5);
		transform: translateY(-2px);
	}

	.pdf-button:active {
		transform: translateY(0);
	}

	@media print {
		.pdf-button {
			display: none;
		}
	}
</style>
