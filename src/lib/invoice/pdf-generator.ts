import type { InvoiceFrontmatter } from '$lib/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * PDF generation configuration
 */
export interface PDFGeneratorConfig {
	/** The invoice data */
	invoice: InvoiceFrontmatter;
	/** The DOM element to convert to PDF (should have class 'faceplate') */
	element: HTMLElement;
	/** Padding between content and page edges (in mm) */
	padding?: number;
	/** Canvas scale for image quality (higher = better quality, slower) */
	scale?: number;
}

/**
 * Page definition structure
 */
interface PageDefinition {
	startIndex: number; // First item index for this page
	endIndex: number; // Last item index (exclusive) for this page
}

/**
 * Find overflowing item index using binary search
 */
function findOverflowingItem(container: HTMLElement, pdfHeight: number): number | null {
	const items = Array.from(container.querySelectorAll('.item'));

	if (items.length === 0) {
		return null;
	}

	// Measure container height
	const elementWidthPx = container.offsetWidth;
	const pdfWidth = 210; // A4 width in mm
	const pxToMmRatio = pdfWidth / elementWidthPx;

	// Check if everything fits
	container.offsetHeight; // Trigger reflow
	const fullRect = container.getBoundingClientRect();
	const fullHeightMm = fullRect.height * pxToMmRatio;

	if (fullHeightMm <= pdfHeight) {
		return null; // Everything fits
	}

	// Binary search for first overflowing item
	let left = 0;
	let right = items.length;

	while (left < right) {
		const mid = Math.floor((left + right) / 2);

		// Hide items after mid (not including mid)
		for (let i = mid + 1; i < items.length; i++) {
			(items[i] as HTMLElement).style.display = 'none';
		}

		// Measure height
		container.offsetHeight; // Trigger reflow
		const rect = container.getBoundingClientRect();
		const heightMm = rect.height * pxToMmRatio;

		// Restore visibility
		for (let i = mid + 1; i < items.length; i++) {
			(items[i] as HTMLElement).style.display = '';
		}

		if (heightMm <= pdfHeight) {
			// Items 0..mid fit, try more
			left = mid + 1;
		} else {
			// Items 0..mid overflow, try fewer
			right = mid;
		}
	}

	return left;
}

/**
 * Build test page with items from startIndex onwards
 */
function buildTestPage(originalContainer: HTMLElement, startIndex: number): HTMLElement {
	// Clone container structure
	const clone = originalContainer.cloneNode(true) as HTMLElement;
	clone.style.position = 'absolute';
	clone.style.left = '-9999px';
	clone.style.width = originalContainer.offsetWidth + 'px';
	document.body.appendChild(clone);

	// Get all items in the clone
	const items = Array.from(clone.querySelectorAll('.item'));

	// Remove items before startIndex
	for (let i = 0; i < startIndex; i++) {
		items[i].remove();
	}

	return clone;
}

/**
 * Calculate page structure
 */
function calculatePages(container: HTMLElement, pdfHeight: number): PageDefinition[] {
	const allItems = Array.from(container.querySelectorAll('.item'));
	const pages: PageDefinition[] = [];

	if (allItems.length === 0) {
		return [{ startIndex: 0, endIndex: 0 }];
	}

	let startIndex = 0;

	while (startIndex < allItems.length) {
		// Build test page with items from startIndex onwards
		const testPage = buildTestPage(container, startIndex);

		const overflowIndex = findOverflowingItem(testPage, pdfHeight);

		// Clean up test page
		document.body.removeChild(testPage);

		if (overflowIndex === null) {
			// All remaining items fit
			pages.push({
				startIndex,
				endIndex: allItems.length
			});
			break;
		} else {
			// Overflow detected
			if (overflowIndex === 0) {
				// Even first item doesn't fit - force it anyway
				pages.push({
					startIndex,
					endIndex: startIndex + 1
				});
				startIndex++;
			} else {
				pages.push({
					startIndex,
					endIndex: startIndex + overflowIndex
				});
				startIndex += overflowIndex;
			}
		}
	}

	return pages;
}

/**
 * Copy canvas contents from original to clone
 */
function copyCanvasContents(original: HTMLElement, clone: HTMLElement): void {
	const originalCanvases = original.querySelectorAll('canvas');
	const clonedCanvases = clone.querySelectorAll('canvas');

	originalCanvases.forEach((originalCanvas, index) => {
		const clonedCanvas = clonedCanvases[index] as HTMLCanvasElement;
		if (clonedCanvas) {
			const context = clonedCanvas.getContext('2d');
			if (context) {
				clonedCanvas.width = originalCanvas.width;
				clonedCanvas.height = originalCanvas.height;
				context.drawImage(originalCanvas, 0, 0);
			}
		}
	});
}

/**
 * Build page element for rendering
 */
function buildPageForRendering(originalContainer: HTMLElement, page: PageDefinition): HTMLElement {
	// Clone container structure
	const clone = originalContainer.cloneNode(true) as HTMLElement;

	// Get all items in the clone
	const items = Array.from(clone.querySelectorAll('.item'));

	// Remove items not in this page's range
	items.forEach((item, index) => {
		if (index < page.startIndex || index >= page.endIndex) {
			item.remove();
		}
	});

	// Copy canvas contents (for QR codes, etc.)
	copyCanvasContents(originalContainer, clone);

	return clone;
}

/**
 * Render a single page element to the PDF
 */
async function renderPageToPDF(
	pageElement: HTMLElement,
	pdf: jsPDF,
	pdfWidth: number,
	pdfHeight: number,
	scale: number,
	addNewPage: boolean,
	originalWidth: number
): Promise<void> {
	// Position off-screen for rendering
	pageElement.style.position = 'absolute';
	pageElement.style.left = '-9999px';
	pageElement.style.width = originalWidth + 'px';
	document.body.appendChild(pageElement);

	// Wait for render
	await new Promise((resolve) => setTimeout(resolve, 100));

	// Capture with html2canvas
	const canvas = await html2canvas(pageElement, {
		scale,
		useCORS: true,
		backgroundColor: null,
		logging: false
	});

	// Remove from DOM
	document.body.removeChild(pageElement);

	// Add new page if not first
	if (addNewPage) {
		pdf.addPage();
	}

	// Add image to PDF
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

/**
 * Generate and download PDF for an invoice
 *
 * Uses simplified item-based pagination:
 * - All unbreakable elements marked with .item class
 * - Each item appears exactly once in natural sequence
 * - New pages clone container structure without already-rendered items
 *
 * @param config PDF generation configuration
 * @returns Promise that resolves when PDF is generated and download initiated
 */
export async function generateInvoicePDF(config: PDFGeneratorConfig): Promise<void> {
	const { invoice, element, scale = 3 } = config;

	const pdf = new jsPDF('p', 'mm', 'a4');
	const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
	const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
	const originalWidth = element.offsetWidth;

	// PHASE 1: Calculate page structure
	const pages = calculatePages(element, pdfHeight);

	// PHASE 2: Render each page
	for (let i = 0; i < pages.length; i++) {
		const page = pages[i];

		// Build page element for rendering
		const pageElement = buildPageForRendering(element, page);

		// Render to PDF
		await renderPageToPDF(
			pageElement,
			pdf,
			pdfWidth,
			pdfHeight,
			scale,
			i > 0, // addNewPage
			originalWidth
		);
	}

	// Download PDF
	pdf.save(`factuur-${invoice.factuurnr}.pdf`);
}
