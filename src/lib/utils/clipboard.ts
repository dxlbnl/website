/**
 * Copies text to the clipboard.
 * Uses the modern Clipboard API if available, falls back to a hidden textarea + execCommand('copy') for non-secure contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
	if (typeof window === 'undefined') return false;

	// Modern API (Secure Contexts)
	if (navigator.clipboard && window.isSecureContext) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch (err) {
			console.error('Failed to use Clipboard API:', err);
		}
	}

	// Fallback (Insecure Contexts or failure)
	try {
		const textArea = document.createElement('textarea');
		textArea.value = text;

		// Ensure textarea is not visible but part of the DOM
		textArea.style.position = 'fixed';
		textArea.style.left = '-9999px';
		textArea.style.top = '0';
		document.body.appendChild(textArea);

		textArea.focus();
		textArea.select();

		const successful = document.execCommand('copy');
		document.body.removeChild(textArea);
		return successful;
	} catch (err) {
		console.error('Clipboard fallback failed:', err);
		return false;
	}
}
