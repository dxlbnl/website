<script lang="ts">
	import QRCode from 'qrcode';
	import { copyToClipboard } from '$lib/utils/clipboard';
	import Led from '$lib/ui/Led.svelte';

	type Props = { shareUrl: string; targetPeerName?: string; onanswer: (sessionId: string) => void };
	let { shareUrl, targetPeerName, onanswer }: Props = $props();

	let qrCanvas: HTMLCanvasElement | null = $state(null);
	let answerInput: string = $state('');

	$effect(() => {
		if (shareUrl && qrCanvas) {
			QRCode.toCanvas(qrCanvas, shareUrl, {
				width: 200,
				margin: 1,
				color: { dark: '#14110b', light: '#efece4' }
			});
		}
	});

	function copyLink() {
		copyToClipboard(shareUrl);
	}

	function connect() {
		const raw = answerInput.trim();
		if (!raw) return;
		try {
			const url = new URL(raw.startsWith('http') ? raw : `https://x/${raw}`);
			const s = url.searchParams.get('s') ?? raw;
			onanswer(s);
		} catch {
			onanswer(raw);
		}
	}
</script>

<div class="panel">
	{#if targetPeerName}
		<div class="status">
			<Led tone="amber" blink /> Waiting for <strong>{targetPeerName}</strong> to connect…
		</div>
	{:else}
		<div class="status"><Led tone="amber" blink /> Waiting for peer…</div>
		<canvas bind:this={qrCanvas} class="qr"></canvas>
		<div class="row">
			<input class="field" readonly value={shareUrl} />
			<button class="btn-ghost" onclick={copyLink}>Copy link</button>
		</div>
		<div class="divider">— or paste their answer —</div>
		<div class="row">
			<input class="field" bind:value={answerInput} placeholder="Paste answer link…" />
			<button class="btn-ghost" disabled={!answerInput.trim()} onclick={connect}>Connect</button>
		</div>
	{/if}
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 3);
		padding: calc(var(--u) * 4);
		background: var(--bg-elev);
		border: 1px solid var(--rule);
		border-radius: var(--radius-card);
		max-width: 520px;
	}

	.status {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1.5);
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
	}

	.qr {
		display: block;
		border-radius: var(--radius);
		image-rendering: pixelated;
	}

	.row {
		display: flex;
		gap: calc(var(--u) * 1.5);
	}

	.field {
		flex: 1;
		min-width: 0;
		background: var(--bg-sunken);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		color: var(--ink);
		font-family: var(--mono);
		font-size: var(--t-mono);
		padding: 9px calc(var(--u) * 2);
		outline: none;
		transition: border-color 0.15s;
	}
	.field:focus {
		border-color: var(--amber);
	}

	.divider {
		text-align: center;
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
</style>
