<script lang="ts">
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import Led from '$lib/ui/Led.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import ShareSetup from './ShareSetup.svelte';
	import ShareWaiting from './ShareWaiting.svelte';
	import ShareApproval from './ShareApproval.svelte';
	import ChatPanel from './ChatPanel.svelte';
	import type { ShareState, ChatEntry, MsgFile } from './types';

	let phase: ShareState = $state('idle');
	let myName: string = $state('');
	let peerName: string = $state('');
	let sessionId: string = $state('');
	let shareUrl: string = $state('');
	let errorMsg: string = $state('');
	let approvalPeerName: string = $state('');
	let pendingAnswer: string = $state('');
	let chat: ChatEntry[] = $state([]);

	let pc: RTCPeerConnection | null = null;
	let dc: RTCDataChannel | null = null;
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	const inFlight = new Map<string, { meta: MsgFile; chunks: string[]; total: number }>();

	function uid() { return Math.random().toString(36).slice(2, 10); }
	function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }

	function mkPc() {
		pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
		return pc;
	}

	function waitIce(conn: RTCPeerConnection) {
		return new Promise<void>((resolve) => {
			if (conn.iceGatheringState === 'complete') { resolve(); return; }
			conn.addEventListener('icegatheringstatechange', () => {
				if (conn.iceGatheringState === 'complete') resolve();
			});
		});
	}

	function openChannel(ch: RTCDataChannel) {
		dc = ch;
		ch.onopen = () => { phase = 'connected'; };
		ch.onmessage = (e: MessageEvent) => onMessage(e.data as string);
	}

	async function onMessage(raw: string) {
		const msg = JSON.parse(raw) as Record<string, unknown>;
		if (msg.type === 'text') {
			chat.push({ kind: 'text', id: uid(), content: msg.content as string, secret: !!(msg.secret), dir: 'in', ts: new Date() });
		} else if (msg.type === 'file-start') {
			const entry: MsgFile = { kind: 'file', id: msg.id as string, name: msg.name as string, size: msg.size as number, mimeType: msg.mimeType as string, dir: 'in', ts: new Date(), progress: 0 };
			inFlight.set(entry.id, { meta: entry, chunks: [], total: msg.totalChunks as number });
			chat.push(entry);
		} else if (msg.type === 'file-chunk') {
			const f = inFlight.get(msg.id as string);
			if (!f) return;
			f.chunks.push(msg.data as string);
			const e = chat.find((c): c is MsgFile => c.id === msg.id && c.kind === 'file');
			if (e) e.progress = f.chunks.length / f.total;
		} else if (msg.type === 'file-end') {
			const f = inFlight.get(msg.id as string);
			if (!f) return;
			const blob = new Blob(f.chunks.map((b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0))), { type: f.meta.mimeType });
			const blobUrl = URL.createObjectURL(blob);
			const e = chat.find((c): c is MsgFile => c.id === msg.id && c.kind === 'file');
			if (e) {
				e.progress = 1;
				e.blobUrl = blobUrl;
				if (f.meta.mimeType.startsWith('text/') || f.meta.mimeType === 'application/json') {
					e.textPreview = (await blob.text()).split('\n').slice(0, 12).join('\n');
				}
			}
			inFlight.delete(msg.id as string);
		}
	}

	async function startSession(name: string) {
		myName = name;
		phase = 'offering';
		try {
			const conn = mkPc();
			openChannel(conn.createDataChannel('share'));
			await conn.setLocalDescription(await conn.createOffer());
			await waitIce(conn);

			const res = await fetch('/api/share', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ offer: JSON.stringify(conn.localDescription), hostName: name })
			});
			if (!res.ok) throw new Error('Failed to create session');
			const { id } = (await res.json()) as { id: string };

			sessionId = id;
			shareUrl = `${window.location.origin}/share/?s=${id}`;
			phase = 'waiting';
			pollHost();
		} catch (e) { fail(e); }
	}

	function pollHost() {
		stopPoll();
		pollTimer = setInterval(async () => {
			const res = await fetch(`/api/share/${sessionId}`).catch(() => null);
			if (!res?.ok) return;
			const data = (await res.json()) as { answer?: string; peerName?: string };
			if (data.answer && phase === 'waiting') {
				stopPoll();
				approvalPeerName = data.peerName ?? 'Guest';
				pendingAnswer = data.answer;
				phase = 'approving';
			}
		}, 2000);
	}

	async function approveGuest() {
		try {
			await fetch(`/api/share/${sessionId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approved: true }) });
			await pc!.setRemoteDescription(JSON.parse(pendingAnswer) as RTCSessionDescriptionInit);
			peerName = approvalPeerName;
			phase = 'connecting';
		} catch (e) { fail(e); }
	}

	async function denyGuest() {
		await fetch(`/api/share/${sessionId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ denied: true }) });
		pendingAnswer = '';
		approvalPeerName = '';
		phase = 'waiting';
		pollHost();
	}

	async function joinSession(id: string) {
		phase = 'guest-init';
		try {
			const res = await fetch(`/api/share/${id}`);
			if (!res.ok) throw new Error('Session not found');
			const data = (await res.json()) as { offer: string; hostName?: string };
			sessionId = id;
			peerName = data.hostName ?? 'Host';

			phase = 'guest-answering';
			const conn = mkPc();
			conn.ondatachannel = (e: RTCDataChannelEvent) => openChannel(e.channel);
			await conn.setRemoteDescription(JSON.parse(data.offer) as RTCSessionDescriptionInit);
			await conn.setLocalDescription(await conn.createAnswer());
			await waitIce(conn);

			const guestName = myName.trim() || 'Guest';
			const put = await fetch(`/api/share/${id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ answer: JSON.stringify(conn.localDescription), peerName: guestName })
			});
			if (!put.ok) throw new Error('Failed to submit answer');
			phase = 'guest-waiting';
			pollGuest();
		} catch (e) { fail(e); }
	}

	function pollGuest() {
		stopPoll();
		pollTimer = setInterval(async () => {
			const res = await fetch(`/api/share/${sessionId}`).catch(() => null);
			if (!res?.ok) return;
			const data = (await res.json()) as { denied?: boolean };
			if (data.denied) { stopPoll(); phase = 'denied'; }
		}, 2000);
	}

	function sendText(content: string, secret: boolean) {
		if (!dc) return;
		dc.send(JSON.stringify({ type: 'text', content, secret }));
		chat.push({ kind: 'text', id: uid(), content, secret, dir: 'out', ts: new Date() });
	}

	async function sendFiles(files: File[]) {
		if (!dc) return;
		const CHUNK = 64 * 1024;
		for (const file of files) {
			const id = uid();
			const buf = await file.arrayBuffer();
			const totalChunks = Math.ceil(file.size / CHUNK);
			const mimeType = file.type || 'application/octet-stream';
			const entry: MsgFile = { kind: 'file', id, name: file.name, size: file.size, mimeType, dir: 'out', ts: new Date(), progress: 0 };
			chat.push(entry);

			dc.send(JSON.stringify({ type: 'file-start', id, name: file.name, size: file.size, mimeType, totalChunks }));
			for (let i = 0; i < totalChunks; i++) {
				const data = btoa(String.fromCharCode(...new Uint8Array(buf.slice(i * CHUNK, (i + 1) * CHUNK))));
				dc.send(JSON.stringify({ type: 'file-chunk', id, index: i, total: totalChunks, data }));
				entry.progress = (i + 1) / totalChunks;
			}
			dc.send(JSON.stringify({ type: 'file-end', id }));

			const blob = new Blob([buf], { type: mimeType });
			entry.blobUrl = URL.createObjectURL(blob);
			if (mimeType.startsWith('text/') || mimeType === 'application/json') {
				entry.textPreview = (await blob.text()).split('\n').slice(0, 12).join('\n');
			}
		}
	}

	function fail(e: unknown) { errorMsg = String(e); phase = 'error'; }
	function reset() { phase = 'idle'; pc?.close(); pc = null; dc = null; stopPoll(); chat = []; }

	$effect(() => {
		const s = $page.url.searchParams.get('s');
		if (s && phase === 'idle') joinSession(s);
	});

	onDestroy(() => {
		stopPoll(); pc?.close();
		chat.forEach((c) => { if (c.kind === 'file' && c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
	});
</script>

<SEO title="Share" description="Send text or files directly to another device. Peer-to-peer, nothing stored." />

<div class="wrap">
	<PageHero eyebrow="// TOOLS · SHARE" title="Share." sub="Peer-to-peer text and file transfer. Nothing stored on the server." />

	{#if phase === 'idle'}
		<ShareSetup onstart={startSession} />

	{:else if phase === 'offering' || phase === 'guest-init' || phase === 'guest-answering' || phase === 'connecting'}
		<div class="status">
			<Led tone="amber" blink />
			<span>
				{phase === 'offering' ? 'Setting up connection…'
				: phase === 'guest-answering' ? 'Creating answer…'
				: phase === 'connecting' ? 'Establishing connection…'
				: 'Connecting…'}
			</span>
		</div>

	{:else if phase === 'waiting'}
		<ShareWaiting {shareUrl} onanswer={(s) => { sessionId = s; pollHost(); }} />

	{:else if phase === 'approving'}
		<ShareApproval peerName={approvalPeerName} onallow={approveGuest} ondeny={denyGuest} />

	{:else if phase === 'guest-waiting'}
		<div class="status"><Led tone="amber" blink /> <span>Waiting for host approval…</span></div>

	{:else if phase === 'denied'}
		<div class="status"><Led tone="danger" /> <span>Connection was declined.</span></div>

	{:else if phase === 'error'}
		<div class="status">
			<Led tone="danger" /> <span>{errorMsg}</span>
			<button class="btn-back" onclick={reset}>↩ try again</button>
		</div>
	{/if}

	{#if phase === 'connected'}
		<ChatPanel {peerName} {chat} onsendtext={sendText} onsendfiles={sendFiles} />
	{/if}
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
		container-type: inline-size;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}

	.status {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 24px 0;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		color: var(--ink-dim);
		border-bottom: 1px solid var(--rule);
	}
</style>
