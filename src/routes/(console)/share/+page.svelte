<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { z } from 'zod';
	import { page } from '$app/stores';
	import Led from '$lib/ui/Led.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import ShareSetup from './ShareSetup.svelte';
	import ShareWaiting from './ShareWaiting.svelte';
	import ShareApproval from './ShareApproval.svelte';
	import ChatPanel from './ChatPanel.svelte';
	import type { ShareState, ChatEntry, MsgFile, TrustedPeer } from './types';

	let phase: ShareState = $state('idle');
	let myName: string = $state('');
	let myDeviceId: string = $state('');
	let peerName: string = $state('');
	let sessionId: string = $state('');
	let shareUrl: string = $state('');
	let errorMsg: string = $state('');
	let approvalPeerName: string = $state('');
	let approvalPeerDeviceId: string = $state('');
	let pendingAnswer: string = $state('');
	let trustedPeers: TrustedPeer[] = $state([]);
	let chat: ChatEntry[] = $state([]);
	let pendingGuestSessionId: string | null = $state(null);

	let pc: RTCPeerConnection | null = null;
	let dc: RTCDataChannel | null = null;
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let pendingPollTimer: ReturnType<typeof setInterval> | null = null;
	const inFlight = new Map<string, { meta: MsgFile; chunks: string[]; total: number }>();

	const MsgText = z.object({ type: z.literal('text'), content: z.string(), secret: z.boolean().optional() });
	const MsgFileStart = z.object({ type: z.literal('file-start'), id: z.string(), name: z.string(), size: z.number(), mimeType: z.string(), totalChunks: z.number() });
	const MsgFileChunk = z.object({ type: z.literal('file-chunk'), id: z.string(), data: z.string() });
	const MsgFileEnd = z.object({ type: z.literal('file-end'), id: z.string() });
	const AnyMsg = z.discriminatedUnion('type', [MsgText, MsgFileStart, MsgFileChunk, MsgFileEnd]);

	function lsGet(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
	function lsSet(key: string, val: string) { try { localStorage.setItem(key, val); } catch { /* */ } }

	function addTrusted(id: string, name: string) {
		trustedPeers = [...trustedPeers.filter((p) => p.id !== id), { id, name }];
		lsSet('share-trusted', JSON.stringify(trustedPeers));
	}
	function removeTrusted(id: string) {
		trustedPeers = trustedPeers.filter((p) => p.id !== id);
		lsSet('share-trusted', JSON.stringify(trustedPeers));
	}
	function isTrusted(id: string) { return trustedPeers.some((p) => p.id === id); }

	onMount(() => {
		// Load/create stable device identity
		let storedId = lsGet('share-device-id');
		if (!storedId || !z.string().uuid().safeParse(storedId).success) {
			storedId = crypto.randomUUID();
			lsSet('share-device-id', storedId);
		}
		myDeviceId = storedId;

		// Load remembered name
		myName = lsGet('share-name') ?? '';

		// Load trusted peers
		try {
			const raw = lsGet('share-trusted');
			trustedPeers = raw ? (JSON.parse(raw) as TrustedPeer[]) : [];
		} catch { trustedPeers = []; }
	});

	function uid() { return Math.random().toString(36).slice(2, 10); }
	function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }
	function stopPendingPoll() { if (pendingPollTimer) { clearInterval(pendingPollTimer); pendingPollTimer = null; } }

	function mkPc() {
		pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
		pc.onconnectionstatechange = () => {
			if (pc?.connectionState === 'failed' || pc?.connectionState === 'disconnected' || pc?.connectionState === 'closed') {
				phase = 'error';
				errorMsg = `Connection state: ${pc.connectionState}`;
			}
		};
		return pc;
	}

	function waitIce(conn: RTCPeerConnection) {
		return new Promise<void>((resolve) => {
			if (conn.iceGatheringState === 'complete') { resolve(); return; }
			let done = false;
			const finish = () => { if (!done) { done = true; resolve(); } };
			conn.addEventListener('icegatheringstatechange', () => {
				if (conn.iceGatheringState === 'complete') finish();
			});
			conn.addEventListener('icecandidate', (e) => { if (e.candidate === null) finish(); });
			setTimeout(finish, 5000);
		});
	}

	function openChannel(ch: RTCDataChannel) {
		dc = ch;
		ch.onopen = () => { phase = 'connected'; };
		ch.onmessage = (e: MessageEvent) => onMessage(e.data as string);
		ch.onclose = () => { phase = 'error'; errorMsg = 'Connection closed by peer'; };
		ch.onerror = () => { phase = 'error'; errorMsg = 'Data channel error occurred'; };
	}

	async function onMessage(raw: string) {
		let parsed: unknown;
		try { parsed = JSON.parse(raw); } catch { return; }
		const result = AnyMsg.safeParse(parsed);
		if (!result.success) return;
		const msg = result.data;

		if (msg.type === 'text') {
			chat.push({ kind: 'text', id: uid(), content: msg.content, secret: !!(msg.secret), dir: 'in', ts: new Date() });
		} else if (msg.type === 'file-start') {
			const totalChunks = typeof msg.totalChunks === 'number' && msg.totalChunks > 0 ? msg.totalChunks : 1;
			const entry: MsgFile = { kind: 'file', id: msg.id, name: msg.name, size: msg.size, mimeType: msg.mimeType, dir: 'in', ts: new Date(), progress: 0 };
			inFlight.set(entry.id, { meta: entry, chunks: [], total: totalChunks });
			chat.push(entry);
		} else if (msg.type === 'file-chunk') {
			const f = inFlight.get(msg.id);
			if (!f) return;
			f.chunks.push(msg.data);
			const e = chat.find((c): c is MsgFile => c.id === msg.id && c.kind === 'file');
			if (e) e.progress = f.chunks.length / f.total;
		} else if (msg.type === 'file-end') {
			const f = inFlight.get(msg.id);
			if (!f) return;
			const blob = new Blob(f.chunks.map((b) => base64ToBinary(b).buffer as ArrayBuffer), { type: f.meta.mimeType });
			const blobUrl = URL.createObjectURL(blob);
			const e = chat.find((c): c is MsgFile => c.id === msg.id && c.kind === 'file');
			if (e) {
				e.progress = 1;
				e.blobUrl = blobUrl;
				if (f.meta.mimeType.startsWith('text/') || f.meta.mimeType === 'application/json') {
					e.textPreview = (await blob.text()).split('\n').slice(0, 12).join('\n');
				}
			}
			inFlight.delete(msg.id);
		}
	}

	async function startSession(name: string, targetDeviceId?: string) {
		myName = name;
		lsSet('share-name', name);
		phase = 'offering';
		try {
			const conn = mkPc();
			openChannel(conn.createDataChannel('share'));
			await conn.setLocalDescription(await conn.createOffer());
			await waitIce(conn);

			const res = await fetch('/api/share', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					offer: JSON.stringify(conn.localDescription),
					hostName: name,
					hostDeviceId: myDeviceId || undefined,
					targetDeviceId
				})
			});
			if (!res.ok) throw new Error('Failed to create session');
			const { id } = (await res.json()) as { id: string };

			sessionId = id;
			shareUrl = `${window.location.origin}/share/?s=${id}`;
			phase = 'waiting';
			pollHost();
		} catch (e) { fail(e); }
	}

	async function startGuestSession(name: string) {
		myName = name;
		if (!pendingGuestSessionId) throw new Error('Session ID not found');
		await joinSession(pendingGuestSessionId, name.trim() || 'Guest');
		pendingGuestSessionId = null;
	}

	function pollHost() {
		stopPoll();
		pollTimer = setInterval(async () => {
			const res = await fetch(`/api/share/${sessionId}`).catch(() => null);
			if (!res?.ok) return;
			const data = (await res.json()) as { answer?: string; peerName?: string; guestDeviceId?: string };
			if (data.answer && phase === 'waiting') {
				stopPoll();
				approvalPeerName = data.peerName ?? 'Guest';
				approvalPeerDeviceId = data.guestDeviceId ?? '';
				pendingAnswer = data.answer;
				// Auto-approve trusted devices
				if (approvalPeerDeviceId && isTrusted(approvalPeerDeviceId)) {
					await approveGuest();
				} else {
					phase = 'approving';
				}
			}
		}, 2000);
	}

	async function approveGuest(remember = false) {
		try {
			if (!pc) throw new Error('Connection not initialized');
			await fetch(`/api/share/${sessionId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ approved: true }) });
			await pc.setRemoteDescription(JSON.parse(pendingAnswer) as RTCSessionDescriptionInit);
			peerName = approvalPeerName;
			if (remember && approvalPeerDeviceId) addTrusted(approvalPeerDeviceId, approvalPeerName);
			phase = 'connecting';
		} catch (e) { fail(e); }
	}

	async function denyGuest() {
		await fetch(`/api/share/${sessionId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ denied: true }) });
		pendingAnswer = '';
		approvalPeerName = '';
		approvalPeerDeviceId = '';
		phase = 'waiting';
		pollHost();
	}

	async function joinSession(id: string, guestName: string) {
		stopPendingPoll();
		phase = 'guest-init';
		try {
			const res = await fetch(`/api/share/${id}`);
			if (!res.ok) throw new Error('Session not found');
			const data = (await res.json()) as { offer: string; hostName?: string; hostDeviceId?: string };
			sessionId = id;
			peerName = data.hostName ?? 'Host';

			const hostDeviceId = data.hostDeviceId;

			phase = 'guest-answering';
			const conn = mkPc();
			conn.ondatachannel = (e: RTCDataChannelEvent) => openChannel(e.channel);
			await conn.setRemoteDescription(JSON.parse(data.offer) as RTCSessionDescriptionInit);
			await conn.setLocalDescription(await conn.createAnswer());
			await waitIce(conn);

			lsSet('share-name', guestName);
			const put = await fetch(`/api/share/${id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ answer: JSON.stringify(conn.localDescription), peerName: guestName, deviceId: myDeviceId || undefined })
			});
			if (!put.ok) throw new Error('Failed to submit answer');

			phase = 'guest-waiting';
			pollGuest(hostDeviceId);
		} catch (e) { fail(e); }
	}

	function pollGuest(hostDeviceId?: string) {
		stopPoll();
		pollTimer = setInterval(async () => {
			const res = await fetch(`/api/share/${sessionId}`).catch(() => null);
			if (!res?.ok) return;
			const data = (await res.json()) as { denied?: boolean; approved?: boolean; hostName?: string };
			if (data.denied) { stopPoll(); phase = 'denied'; }
			// When approved, remember the host as trusted (they implicitly trusted us by approving)
			if (data.approved && hostDeviceId && !isTrusted(hostDeviceId)) {
				addTrusted(hostDeviceId, data.hostName ?? peerName);
			}
		}, 2000);
	}

	function binaryToBase64(buf: Uint8Array): string {
		const chunked = [];
		for (let i = 0; i < buf.length; i += 8192) {
			const slice = buf.subarray(i, i + 8192);
			chunked.push(String.fromCharCode.apply(null, Array.from(slice) as number[]));
		}
		return btoa(chunked.join(''));
	}

	function base64ToBinary(b64: string): Uint8Array {
		const binaryStr = atob(b64);
		const bytes = new Uint8Array(binaryStr.length);
		for (let i = 0; i < binaryStr.length; i++) {
			bytes[i] = binaryStr.charCodeAt(i);
		}
		return bytes;
	}

	function startPendingPoll() {
		stopPendingPoll();
		if (!myDeviceId) return;
		pendingPollTimer = setInterval(async () => {
			if (phase !== 'idle') return;
			const res = await fetch(`/api/share/pending?for=${myDeviceId}`).catch(() => null);
			if (!res?.ok) return;
			const data = (await res.json()) as { id: string; hostName: string } | null;
			if (data) joinSession(data.id, myName.trim() || 'Guest');
		}, 3000);
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
				const chunk = new Uint8Array(buf.slice(i * CHUNK, (i + 1) * CHUNK));
				const data = binaryToBase64(chunk);
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
	function reset() { phase = 'idle'; pc?.close(); pc = null; dc = null; stopPoll(); chat = []; startPendingPoll(); }

	$effect(() => {
		const s = $page.url.searchParams.get('s');
		if (s && phase === 'idle') {
			pendingGuestSessionId = s;
			phase = 'guest-setup';
		}
	});

	// Start pending poll once we have a device ID and no ?s= param
	$effect(() => {
		if (myDeviceId && !$page.url.searchParams.get('s')) startPendingPoll();
	});

	onDestroy(() => {
		stopPoll(); stopPendingPoll(); pc?.close();
		chat.forEach((c) => { if (c.kind === 'file' && c.blobUrl) URL.revokeObjectURL(c.blobUrl); });
	});
</script>

<SEO title="Share" description="Send text or files directly to another device. Peer-to-peer, nothing stored." />

<div class="wrap">
	<PageHero eyebrow="// TOOLS · SHARE" title="Share." sub="Peer-to-peer text and file transfer. Nothing stored on the server." />

	{#if phase === 'idle'}
		<ShareSetup
			name={myName}
			{trustedPeers}
			onstart={(name) => startSession(name)}
			onstartdirected={(peer) => startSession(myName || 'Host', peer.id)}
			onforget={removeTrusted}
		/>

	{:else if phase === 'guest-setup'}
		<ShareSetup onstart={startGuestSession} />

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
		<ShareApproval
			peerName={approvalPeerName}
			isTrusted={isTrusted(approvalPeerDeviceId)}
			onallow={(remember) => approveGuest(remember)}
			ondeny={denyGuest}
		/>

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
