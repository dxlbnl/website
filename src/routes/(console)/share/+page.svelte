<script lang="ts">
	import { nanoid } from 'nanoid';
	import { onDestroy, onMount } from 'svelte';
	import { z } from 'zod';
	import { page } from '$app/state';
	import Led from '$lib/ui/Led.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import ShareSetup from './ShareSetup.svelte';
	import ShareWaiting from './ShareWaiting.svelte';
	import ShareApproval from './ShareApproval.svelte';
	import ShareInvite from './ShareInvite.svelte';
	import ChatPanel from './ChatPanel.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import type { ShareState, ChatEntry, MsgFile, TrustedPeer } from './types';

	let phase: ShareState = $state('idle');
	let isReconnecting: boolean = $state(false);
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
	let directedTo: string = $state('');
	let nearbySessions: { id: string; hostName: string; hostDeviceId: string }[] = $state([]);

	let pc: RTCPeerConnection | null = null;
	let dc: RTCDataChannel | null = null;
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let pendingPollTimer: ReturnType<typeof setInterval> | null = null;
	const inFlight = new SvelteMap<string, { meta: MsgFile; chunks: ArrayBuffer[]; total: number }>();

	const MsgText = z.object({
		type: z.literal('text'),
		content: z.string(),
		secret: z.boolean().optional()
	});
	const MsgFileStart = z.object({
		type: z.literal('file-start'),
		id: z.string(),
		name: z.string(),
		size: z.number(),
		mimeType: z.string(),
		totalChunks: z.number()
	});
	const MsgFileChunk = z.object({
		type: z.literal('file-chunk'),
		id: z.string(),
		data: z.string(),
		index: z.number().optional(),
		total: z.number().optional()
	});
	const MsgFileEnd = z.object({ type: z.literal('file-end'), id: z.string() });
	const AnyMsg = z.discriminatedUnion('type', [MsgText, MsgFileStart, MsgFileChunk, MsgFileEnd]);

	function lsGet(key: string) {
		try {
			return localStorage.getItem(key);
		} catch {
			return null;
		}
	}
	function lsSet(key: string, val: string) {
		try {
			localStorage.setItem(key, val);
		} catch {
			/* */
		}
	}

	function addTrusted(id: string, name: string) {
		trustedPeers = [...trustedPeers.filter((p) => p.id !== id), { id, name }];
		lsSet('share-trusted', JSON.stringify(trustedPeers));
	}
	function removeTrusted(id: string) {
		trustedPeers = trustedPeers.filter((p) => p.id !== id);
		lsSet('share-trusted', JSON.stringify(trustedPeers));
	}
	function isTrusted(id: string) {
		return trustedPeers.some((p) => p.id === id);
	}

	onMount(() => {
		// Load/create stable device identity
		let storedId = lsGet('share-device-id');
		if (!storedId || storedId.length < 10) {
			storedId = nanoid();
			lsSet('share-device-id', storedId);
		}
		myDeviceId = storedId;
		console.log('[Share] Device initialized. ID:', myDeviceId);

		// Load remembered name
		myName = lsGet('share-name') ?? '';

		// Load trusted peers
		try {
			const raw = lsGet('share-trusted');
			trustedPeers = raw ? (JSON.parse(raw) as TrustedPeer[]) : [];
		} catch {
			trustedPeers = [];
		}
	});

	function uid() {
		return Math.random().toString(36).slice(2, 10);
	}
	function stopPoll() {
		if (pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}
	function stopPendingPoll() {
		if (pendingPollTimer) {
			clearInterval(pendingPollTimer);
			pendingPollTimer = null;
		}
	}

	async function waitForBuffer() {
		if (!dc) return;
		if (dc.bufferedAmount < 1024 * 1024 * 4) return;
		return new Promise<void>((resolve) => {
			const check = () => {
				if (!dc || dc.readyState !== 'open' || dc.bufferedAmount < 1024 * 1024 * 2) resolve();
				else setTimeout(check, 50);
			};
			check();
		});
	}

	function mkPc() {
		console.log('[Share] Initializing RTCPeerConnection...');
		pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
		pc.onconnectionstatechange = () => {
			console.log('[Share] Peer connection state:', pc?.connectionState);
			if (pc?.connectionState === 'failed') {
				if (sessionId) {
					console.warn('[Share] Connection failed, attempting resurrection...');
					const s = sessionId;
					reset();
					// Small delay to ensure cleanup finished
					setTimeout(() => {
						if (page.url.searchParams.get('s') === s) {
							// Effect will handle it
						} else {
							// Manual trigger if URL was cleared
							resumeHostSession(s);
						}
					}, 100);
				} else {
					phase = 'error';
					errorMsg = 'Connection failed';
				}
			} else if (pc?.connectionState === 'disconnected') {
				isReconnecting = true;
			} else if (pc?.connectionState === 'connected') {
				isReconnecting = false;
				phase = 'connected';
			}
		};
		pc.oniceconnectionstatechange = () => {
			console.log('[Share] ICE connection state:', pc?.iceConnectionState);
		};
		return pc;
	}

	function waitIce(conn: RTCPeerConnection) {
		console.log('[Share] Waiting for ICE candidates...');
		return new Promise<void>((resolve) => {
			if (conn.iceGatheringState === 'complete') {
				resolve();
				return;
			}
			let done = false;
			const finish = () => {
				if (!done) {
					console.log('[Share] ICE gathering finished (timeout or complete)');
					done = true;
					resolve();
				}
			};
			conn.addEventListener('icegatheringstatechange', () => {
				console.log('[Share] ICE gathering state:', conn.iceGatheringState);
				if (conn.iceGatheringState === 'complete') finish();
			});
			conn.addEventListener('icecandidate', (e) => {
				if (e.candidate === null) {
					console.log('[Share] Null candidate received');
					finish();
				} else if (e.candidate.candidate.includes('srflx')) {
					console.log('[Share] STUN candidate found, proceeding...');
					finish();
				}
			});
			setTimeout(finish, 1500);
		});
	}

	function openChannel(ch: RTCDataChannel, onConnected?: () => void) {
		console.log('[Share] Data channel state:', ch.readyState);
		dc = ch;
		const onOpen = () => {
			console.log('[Share] Data channel OPEN');
			phase = 'connected';
			isReconnecting = false;
			stopPoll();
			stopPendingPoll();
			if (onConnected) onConnected();
		};
		ch.onopen = onOpen;
		if (ch.readyState === 'open') onOpen();
		ch.onmessage = (e: MessageEvent) => onMessage(e.data as string);
		ch.onclose = () => {
			console.log('[Share] Data channel CLOSED');
			phase = 'error';
			errorMsg = 'Connection closed by peer';
		};
		ch.onerror = (e) => {
			console.error('[Share] Data channel ERROR:', e);
			phase = 'error';
			errorMsg = 'Data channel error occurred';
		};
	}

	async function onMessage(raw: string) {
		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return;
		}
		const result = AnyMsg.safeParse(parsed);
		if (!result.success) return;
		const msg = result.data;

		if (msg.type === 'text') {
			chat.push({
				kind: 'text',
				id: uid(),
				content: msg.content,
				secret: !!msg.secret,
				dir: 'in',
				ts: new Date()
			});
		} else if (msg.type === 'file-start') {
			const totalChunks =
				typeof msg.totalChunks === 'number' && msg.totalChunks > 0 ? msg.totalChunks : 1;
			const entry = $state<MsgFile>({
				kind: 'file',
				id: msg.id,
				name: msg.name,
				size: msg.size,
				mimeType: msg.mimeType,
				dir: 'in',
				ts: new Date(),
				progress: 0
			});
			inFlight.set(entry.id, { meta: entry, chunks: [], total: totalChunks });
			chat.push(entry);
		} else if (msg.type === 'file-chunk') {
			const f = inFlight.get(msg.id);
			if (!f) return;
			f.chunks.push(base64ToBinary(msg.data).buffer as ArrayBuffer);
			const e = chat.find((c): c is MsgFile => c.id === msg.id && c.kind === 'file');
			if (e) e.progress = f.chunks.length / f.total;
		} else if (msg.type === 'file-end') {
			const f = inFlight.get(msg.id);
			if (!f) return;
			const blob = new Blob(f.chunks, { type: f.meta.mimeType });
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
		console.log('[Share] Starting new session...', { name, targetDeviceId });
		myName = name;
		lsSet('share-name', name);
		directedTo = targetDeviceId
			? trustedPeers.find((p) => p.id === targetDeviceId)?.name ?? ''
			: '';
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
			console.log('[Share] Session created. ID:', id);
			shareUrl = `${window.location.origin}/share/?s=${id}`;
			phase = 'waiting';
			pollHost();
		} catch (e) {
			console.error('[Share] Start session failed:', e);
			fail(e);
		}
	}

	async function startGuestSession(name: string) {
		myName = name;
		const s = page.url.searchParams.get('s');
		if (!s) {
			fail(new Error('Session ID not found'));
			return;
		}
		await joinSession(s, name.trim() || 'Guest');
	}

	function pollHost() {
		console.log('[Share] Starting host poll for answer...', { sessionId });
		stopPoll();
		const start = Date.now();
		pollTimer = setInterval(async () => {
			if (Date.now() - start > 30000) {
				console.warn('[Share] Host poll timeout (30s)');
				fail(new Error('Guest did not answer in time'));
				return;
			}
			const res = await fetch(`/api/share/${sessionId}`).catch((err) => {
				console.error('[Share] Host poll fetch failed:', err);
				return null;
			});
			if (res && res.status === 404) {
				console.warn('[Share] Host poll: Session 404, abandoning.');
				fail(new Error('Session closed'));
				return;
			}
			if (!res?.ok) return;
			const data = (await res.json()) as {
				answer?: string;
				peerName?: string;
				guestDeviceId?: string;
			};
			if (data.answer && phase === 'waiting') {
				console.log('[Share] Host poll: Received answer from', data.peerName);
				stopPoll();
				approvalPeerName = data.peerName ?? 'Guest';
				approvalPeerDeviceId = data.guestDeviceId ?? '';
				pendingAnswer = data.answer;
				// Auto-approve trusted devices
				if (approvalPeerDeviceId && isTrusted(approvalPeerDeviceId)) {
					console.log('[Share] Auto-approving trusted peer:', approvalPeerName);
					await approveGuest();
				} else {
					console.log('[Share] Prompting for approval from:', approvalPeerName);
					phase = 'approving';
				}
			}
		}, 2000);
	}

	async function approveGuest(remember = false) {
		console.log('[Share] Approving guest...', { approvalPeerName, remember });
		try {
			if (!pc) throw new Error('Connection not initialized');
			await fetch(`/api/share/${sessionId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ approved: true })
			});
			await pc.setRemoteDescription(JSON.parse(pendingAnswer) as RTCSessionDescriptionInit);
			peerName = approvalPeerName;
			if (remember && approvalPeerDeviceId) {
				console.log('[Share] Remembering peer as trusted:', approvalPeerName);
				addTrusted(approvalPeerDeviceId, approvalPeerName);
			}
			phase = 'connecting';
		} catch (e) {
			console.error('[Share] Failed to approve guest:', e);
			fail(e);
		}
	}

	async function denyGuest() {
		console.log('[Share] Denying guest connection...', { sessionId });
		try {
			await fetch(`/api/share/${sessionId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ denied: true })
			});
		} catch (e) {
			console.error('[Share] Failed to deny guest:', e);
		}
		pendingAnswer = '';
		approvalPeerName = '';
		approvalPeerDeviceId = '';
		phase = 'waiting';
		pollHost();
	}

	async function joinSession(id: string, guestName: string) {
		console.log('[Share] Joining session:', { id, guestName });
		stopPendingPoll();
		phase = 'guest-init';
		try {
			const res = await fetch(`/api/share/${id}`);
			if (!res.ok) throw new Error('Session not found');
			const data = (await res.json()) as {
				offer: string;
				hostName?: string;
				hostDeviceId?: string;
			};
			sessionId = id;
			peerName = data.hostName ?? 'Host';

			const hostDeviceId = data.hostDeviceId;

			console.log('[Share] Received offer from host:', peerName);
			phase = 'guest-answering';
			const conn = mkPc();
			conn.ondatachannel = (e: RTCDataChannelEvent) =>
				openChannel(e.channel, () => {
					console.log('[Share] Guest: Channel opened, saving host as trusted if needed');
					if (hostDeviceId && !isTrusted(hostDeviceId)) {
						addTrusted(hostDeviceId, data.hostName ?? peerName);
					}
				});
			await conn.setRemoteDescription(JSON.parse(data.offer) as RTCSessionDescriptionInit);
			await conn.setLocalDescription(await conn.createAnswer());
			await waitIce(conn);

			lsSet('share-name', guestName);
			console.log('[Share] Submitting answer to host...');
			const put = await fetch(`/api/share/${id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					answer: JSON.stringify(conn.localDescription),
					peerName: guestName,
					deviceId: myDeviceId || undefined
				})
			});
			if (!put.ok) throw new Error('Failed to submit answer');

			phase = 'guest-waiting';
			pollGuest(hostDeviceId);
		} catch (e) {
			console.error('[Share] Join session failed:', e);
			fail(e);
		}
	}

	async function resumeHostSession(id: string) {
		console.log('[Share] Resuming session as Host:', id);
		sessionId = id;
		phase = 'offering';
		try {
			const conn = mkPc();
			openChannel(conn.createDataChannel('share'));
			await conn.setLocalDescription(await conn.createOffer());
			await waitIce(conn);

			// Update offer on server. This clears answer/approved status on server.
			await fetch(`/api/share/${id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ offer: JSON.stringify(conn.localDescription) })
			});
			phase = 'waiting';
			pollHost();
		} catch (e) {
			console.error('[Share] Resume session failed:', e);
			fail(e);
		}
	}

	let guestOffer: string = '';
	function pollGuest(hostDeviceId?: string) {
		console.log('[Share] Starting guest poll for approval...');
		stopPoll();
		const start = Date.now();
		pollTimer = setInterval(async () => {
			if (Date.now() - start > 30000) {
				console.warn('[Share] Guest poll timeout (30s)');
				fail(new Error('Host did not approve in time'));
				return;
			}
			const res = await fetch(`/api/share/${sessionId}`).catch((err) => {
				console.error('[Share] Guest poll fetch failed:', err);
				return null;
			});
			if (res && res.status === 404) {
				console.warn('[Share] Guest poll: Session 404, host likely disconnected.');
				fail(new Error('Session closed by host'));
				return;
			}
			if (!res?.ok) return;
			const data = (await res.json()) as {
				denied?: boolean;
				approved?: boolean;
				hostName?: string;
				offer?: string;
			};

			// Detect if host refreshed and re-init joining
			if (data.offer && guestOffer && data.offer !== guestOffer) {
				console.log('[Share] Host refreshed session, re-joining...');
				stopPoll();
				joinSession(sessionId, myName || 'Guest');
				return;
			}
			if (data.offer) guestOffer = data.offer;

			if (data.denied) {
				console.log('[Share] Guest poll: Host denied connection.');
				stopPoll();
				phase = 'denied';
			}
			// When approved, remember the host as trusted (they implicitly trusted us by approving)
			if (data.approved) {
				console.log('[Share] Guest poll: Host approved connection!');
				stopPoll();
				if (phase === 'guest-waiting') phase = 'connecting';
				if (hostDeviceId && !isTrusted(hostDeviceId)) {
					console.log('[Share] Guest: Remembering host as trusted:', data.hostName ?? peerName);
					addTrusted(hostDeviceId, data.hostName ?? peerName);
				}
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
		console.log('[Share] Starting pending poll for directed invites...');
		pendingPollTimer = setInterval(async () => {
			if (phase !== 'idle') return;
			const res = await fetch(`/api/share/pending?for=${myDeviceId}`).catch(() => null);
			if (!res?.ok) return;
			const data = (await res.json()) as {
				invite: { id: string; hostName: string } | null;
				hosting: { id: string; peerName?: string } | null;
				nearby: { id: string; hostName: string; hostDeviceId: string }[];
			};
			nearbySessions = data.nearby;
			if (data.invite) {
				console.log('[Share] Found pending invite from:', data.invite.hostName, 'ID:', data.invite.id);
				stopPendingPoll();
				sessionId = data.invite.id;
				approvalPeerName = data.invite.hostName;
				phase = 'guest-invited';
			} else if (data.hosting) {
				// We found a session we are hosting.
				// For now, let's just log it. We can show a 'Resume' button in ShareSetup.
				console.log('[Share] Found active hosting session:', data.hosting.id);
			}
		}, 3000);
	}

	async function declineInvite() {
		console.log('[Share] Declining invite for session:', sessionId);
		try {
			await fetch(`/api/share/${sessionId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ denied: true })
			});
		} catch (e) {
			console.error('[Share] Failed to send decline:', e);
		}
		reset();
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
			const totalChunks = Math.ceil(file.size / CHUNK);
			const mimeType = file.type || 'application/octet-stream';
			const entry = $state<MsgFile>({
				kind: 'file',
				id,
				name: file.name,
				size: file.size,
				mimeType,
				dir: 'out',
				ts: new Date(),
				progress: 0
			});
			chat.push(entry);

			dc.send(
				JSON.stringify({
					type: 'file-start',
					id,
					name: file.name,
					size: file.size,
					mimeType,
					totalChunks
				})
			);
			for (let i = 0; i < totalChunks; i++) {
				if (!dc || dc.readyState !== 'open') break;
				const blobSlice = file.slice(i * CHUNK, (i + 1) * CHUNK);
				const buf = await blobSlice.arrayBuffer();
				const chunk = new Uint8Array(buf);
				const data = binaryToBase64(chunk);

				await waitForBuffer();
				if (!dc || dc.readyState !== 'open') break;

				dc.send(JSON.stringify({ type: 'file-chunk', id, index: i, total: totalChunks, data }));
				entry.progress = (i + 1) / totalChunks;
			}
			if (dc && dc.readyState === 'open') {
				dc.send(JSON.stringify({ type: 'file-end', id }));
			}

			entry.blobUrl = URL.createObjectURL(file);
			if (mimeType.startsWith('text/') || mimeType === 'application/json') {
				entry.textPreview = (await file.slice(0, 1024 * 4).text())
					.split('\n')
					.slice(0, 12)
					.join('\n');
			}
		}
	}

	function fail(e: unknown) {
		stopPoll();
		errorMsg = String(e);
		phase = 'error';
	}
	function reset() {
		if (dc) {
			dc.onclose = null;
			dc.onerror = null;
			dc.onmessage = null;
		}
		if (pc) {
			pc.onconnectionstatechange = null;
		}
		pc?.close();
		pc = null;
		dc = null;
		stopPoll();
		chat = [];
		directedTo = '';
		inFlight.clear();
		isReconnecting = false;
		if (window.location.search) history.replaceState({}, '', window.location.pathname);
		phase = 'idle';
		startPendingPoll();
	}

	$effect(() => {
		const s = page.url.searchParams.get('s');
		if (s && phase === 'idle' && myDeviceId) {
			console.log('[Share] Detected session ID in URL:', s);
			// Check if we are the host of this session
			fetch(`/api/share/${s}`)
				.then((r) => r.json())
				.then((data) => {
					if (data.hostDeviceId === myDeviceId) {
						resumeHostSession(s);
					} else {
						if (myName) {
							console.log('[Share] Auto-joining as Guest:', myName);
							startGuestSession(myName);
						} else {
							phase = 'guest-setup';
						}
					}
				})
				.catch(() => {
					// Fallback to setup if session check fails
					phase = 'guest-setup';
				});
		}
	});

	// Start pending poll once we have a device ID and no ?s= param
	$effect(() => {
		if (myDeviceId && !page.url.searchParams.get('s')) startPendingPoll();
	});

	onDestroy(() => {
		stopPoll();
		stopPendingPoll();
		pc?.close();
		chat.forEach((c) => {
			if (c.kind === 'file' && c.blobUrl) URL.revokeObjectURL(c.blobUrl);
		});
	});
</script>

<SEO
	title="Share"
	description="Send text or files directly to another device. Peer-to-peer, nothing stored."
/>

<div class="wrap">
	<PageHero
		eyebrow="// TOOLS · SHARE"
		title="Share."
		sub="Easily share text and files across your devices — nothing is stored on the server."
	/>

	{#if phase === 'idle'}
		<ShareSetup
			name={myName}
			{trustedPeers}
			{nearbySessions}
			onstart={(name) => startSession(name)}
			onjoin={(id) => joinSession(id, myName || 'Guest')}
			onstartdirected={(peer) => startSession(myName || 'Host', peer.id)}
			onforget={removeTrusted}
		/>
	{:else if phase === 'guest-setup'}
		<ShareSetup
			name={myName}
			{trustedPeers}
			isJoining={true}
			onstart={startGuestSession}
			onforget={removeTrusted}
		/>
	{:else if phase === 'offering' || phase === 'guest-init' || phase === 'guest-answering' || phase === 'connecting'}
		<div class="status">
			<Led tone="amber" blink />
			<span>
				{phase === 'offering'
					? 'Setting up connection…'
					: phase === 'guest-answering'
						? 'Creating answer…'
						: phase === 'connecting'
							? 'Establishing connection…'
							: 'Connecting…'}
			</span>
			<button class="btn-back" onclick={reset} style="margin-left: auto;">cancel</button>
		</div>
	{:else if phase === 'waiting'}
		<ShareWaiting
			{shareUrl}
			targetPeerName={directedTo
				? trustedPeers.find((p) => p.id === directedTo)?.name || 'trusted peer'
				: undefined}
			onanswer={(s) => {
				sessionId = s;
				pollHost();
			}}
		/>
		<div style="margin-top: 12px;">
			<button class="btn-ghost" onclick={reset}>← cancel session</button>
		</div>
	{:else if phase === 'guest-invited'}
		<ShareInvite
			peerName={approvalPeerName}
			onaccept={() => joinSession(sessionId, myName || 'Guest')}
			ondecline={declineInvite}
		/>
	{:else if phase === 'approving'}
		<ShareApproval
			peerName={approvalPeerName}
			isTrusted={isTrusted(approvalPeerDeviceId)}
			onallow={(remember) => approveGuest(remember)}
			ondeny={denyGuest}
		/>
	{:else if phase === 'guest-waiting'}
		<div class="status">
			<Led tone="amber" blink />
			<span>Waiting for host approval…</span>
			<button class="btn-back" onclick={reset} style="margin-left: auto;">cancel</button>
		</div>
	{:else if phase === 'denied'}
		<div class="status">
			<Led tone="danger" />
			<span>Connection was declined.</span>
			<button class="btn-back" onclick={reset} style="margin-left: auto;">↩ try again</button>
		</div>
	{:else if phase === 'error'}
		<div class="status">
			<Led tone="danger" /> <span>{errorMsg}</span>
			<button class="btn-back" onclick={reset} style="margin-left: auto;">↩ try again</button>
		</div>
	{/if}

	{#if phase === 'connected'}
		<ChatPanel {peerName} {chat} {isReconnecting} onsendtext={sendText} onsendfiles={sendFiles} />
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
