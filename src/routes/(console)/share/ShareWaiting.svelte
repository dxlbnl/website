<script lang="ts">
	import { tick } from 'svelte';
	import QRCode from 'qrcode';
	import Led from '$lib/ui/Led.svelte';

	type Props = { shareUrl: string; onanswer: (sessionId: string) => void };
	let { shareUrl, onanswer }: Props = $props();

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
		navigator.clipboard.writeText(shareUrl);
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
	<div class="status"><Led tone="amber" blink /> Waiting for peer…</div>
	<canvas bind:this={qrCanvas} class="qr"></canvas>
	<div class="row">
		<input class="input" readonly value={shareUrl} />
		<button class="btn-outline" onclick={copyLink}>Copy link</button>
	</div>
	<div class="divider">— or paste their answer —</div>
	<div class="row">
		<input class="input" bind:value={answerInput} placeholder="Paste answer link…" />
		<button class="btn-outline" disabled={!answerInput.trim()} onclick={connect}>Connect</button>
	</div>
</div>

<style>
	.panel {
		display: flex; flex-direction: column; gap: calc(var(--u) * 3);
		padding: calc(var(--u) * 4);
		background: var(--bg-elev);
		border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
		border-radius: var(--radius-card);
	}
	.status { display: flex; align-items: center; gap: calc(var(--u) * 1.5); font-size: var(--t-sm); color: var(--ink-dim); }
	.qr { display: block; border-radius: var(--radius); image-rendering: pixelated; }
	.row { display: flex; gap: calc(var(--u) * 1.5); }
	.input {
		flex: 1; min-width: 0;
		background: var(--bg-sunken);
		border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
		border-radius: var(--radius); color: var(--ink);
		font-family: inherit; font-size: var(--t-sm);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 2); outline: none;
	}
	.input:focus { border-color: var(--cyan); }
	.divider { text-align: center; font-size: var(--t-micro); color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.08em; }
	.btn-outline {
		background: transparent; color: var(--cyan);
		border: 1px solid var(--cyan); border-radius: var(--radius);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 2);
		font-family: inherit; font-size: var(--t-sm); cursor: pointer; white-space: nowrap;
	}
	.btn-outline:hover { background: color-mix(in srgb, var(--cyan) 10%, transparent); }
	.btn-outline:disabled { opacity: 0.4; cursor: default; }
</style>
