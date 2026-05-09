import { SvelteMap } from 'svelte/reactivity';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import type { ShareState, ChatEntry, MsgFile, TrustedPeer } from './types';

// ─────────────────────────────────────────────────────────────────
// Pure exports (used directly in tests)
// ─────────────────────────────────────────────────────────────────

export const VALID_TRANSITIONS: Record<ShareState, ShareState[]> = {
	idle: ['offering', 'guest-setup', 'guest-invited', 'guest-init'],
	offering: ['waiting', 'error', 'idle'],
	waiting: ['approving', 'connecting', 'idle', 'error'],
	approving: ['connecting', 'waiting', 'error'],
	'guest-setup': ['guest-init', 'idle'],
	'guest-init': ['guest-answering', 'error'],
	'guest-answering': ['guest-waiting', 'guest-init', 'error'],
	// 'connected' added: data channel onopen fires while still in guest-waiting (ICE completes
	// before the next poll tick sees approved:true), so the direct jump must be valid.
	'guest-waiting': ['connecting', 'connected', 'denied', 'guest-answering', 'guest-init', 'error'],
	'guest-invited': ['guest-init', 'idle'],
	connecting: ['connected', 'error'],
	connected: ['error', 'idle'],
	denied: ['idle'],
	error: ['idle'],
};

export function isValidTransition(from: ShareState, to: ShareState): boolean {
	return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

/** Assemble indexed chunks, discarding undefined holes left by out-of-order delivery. */
export function assembleChunks(chunks: (ArrayBuffer | undefined)[]): ArrayBuffer[] {
	return chunks.filter((c): c is ArrayBuffer => c !== undefined);
}

export function binaryToBase64(buf: Uint8Array): string {
	const parts: string[] = [];
	for (let i = 0; i < buf.length; i += 8192) {
		parts.push(String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + 8192)) as number[]));
	}
	return btoa(parts.join(''));
}

export function base64ToBinary(b64: string): Uint8Array {
	const s = atob(b64);
	const out = new Uint8Array(s.length);
	for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
	return out;
}

/** Non-overlapping async poll loop. Returns when done, timed out, or aborted. */
export async function pollLoop(
	signal: AbortSignal,
	tick: () => Promise<'done' | 'continue'>,
	intervalMs: number,
	timeoutMs: number
): Promise<'done' | 'timeout' | 'aborted'> {
	const deadline = Date.now() + timeoutMs;
	while (!signal.aborted) {
		if (Date.now() > deadline) return 'timeout';
		const result = await tick().catch((): 'continue' => 'continue');
		if (result === 'done') return 'done';
		if (signal.aborted) return 'aborted';
		await new Promise<void>((r) => setTimeout(r, intervalMs));
	}
	return 'aborted';
}

/** Waits for the data channel buffer to drain, with an absolute timeout. */
export async function waitForBuffer(
	dc: Pick<RTCDataChannel, 'readyState' | 'bufferedAmount'> | null,
	timeoutMs = 5000
): Promise<void> {
	if (!dc || dc.bufferedAmount < 1024 * 1024 * 4) return;
	const deadline = Date.now() + timeoutMs;
	return new Promise<void>((resolve) => {
		const check = () => {
			if (
				!dc ||
				dc.readyState !== 'open' ||
				dc.bufferedAmount < 1024 * 1024 * 2 ||
				Date.now() > deadline
			)
				resolve();
			else setTimeout(check, 50);
		};
		check();
	});
}

export const MsgTextSchema = z.object({
	type: z.literal('text'),
	content: z.string(),
	secret: z.boolean().optional(),
});
export const MsgFileStartSchema = z.object({
	type: z.literal('file-start'),
	id: z.string(),
	name: z.string(),
	size: z.number(),
	mimeType: z.string(),
	totalChunks: z.number(),
});
export const MsgFileChunkSchema = z.object({
	type: z.literal('file-chunk'),
	id: z.string(),
	data: z.string(),
	index: z.number().optional(),
	total: z.number().optional(),
});
export const MsgFileEndSchema = z.object({ type: z.literal('file-end'), id: z.string() });
export const AnyMsg = z.discriminatedUnion('type', [
	MsgTextSchema,
	MsgFileStartSchema,
	MsgFileChunkSchema,
	MsgFileEndSchema,
]);

// ─────────────────────────────────────────────────────────────────
// Reactive session factory
// ─────────────────────────────────────────────────────────────────

export function createShare() {
	let phase: ShareState = $state('idle');
	let isReconnecting = $state(false);
	let myName = $state('');
	let myDeviceId = $state('');
	let peerName = $state('');
	let sessionId = $state('');
	let shareUrl = $state('');
	let errorMsg = $state('');
	let approvalPeerName = $state('');
	let approvalPeerDeviceId = $state('');
	let pendingAnswer = $state('');
	let trustedPeers: TrustedPeer[] = $state([]);
	let chat: ChatEntry[] = $state([]);
	let directedTo = $state('');
	let nearbySessions: { id: string; hostName: string; hostDeviceId: string }[] = $state([]);
	/** Session ID stored when a guest-join URL is detected, so guest-setup screen can use it. */
	let guestJoinSessionId = '';
	/** Last offer seen by guest — used to detect host refresh. Set before poll starts. */
	let guestOffer = '';

	let pc: RTCPeerConnection | null = null;
	let dc: RTCDataChannel | null = null;
	let pollAbort: AbortController | null = null;
	let pendingPollAbort: AbortController | null = null;
	const inFlight = new SvelteMap<
		string,
		{ meta: MsgFile; chunks: (ArrayBuffer | undefined)[]; total: number }
	>();

	// ── localStorage ───────────────────────────────────────────────

	function lsGet(key: string): string | null {
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

	// ── Trust ──────────────────────────────────────────────────────

	function addTrusted(id: string, name: string) {
		trustedPeers = [...trustedPeers.filter((p) => p.id !== id), { id, name }];
		lsSet('share-trusted', JSON.stringify(trustedPeers));
	}
	function removeTrustedById(id: string) {
		trustedPeers = trustedPeers.filter((p) => p.id !== id);
		lsSet('share-trusted', JSON.stringify(trustedPeers));
	}
	function isTrustedId(id: string) {
		return trustedPeers.some((p) => p.id === id);
	}

	// ── State machine ──────────────────────────────────────────────

	function transition(next: ShareState) {
		if (!isValidTransition(phase, next)) {
			console.warn(`[Share] transition blocked: ${phase} → ${next}`);
			return;
		}
		console.log(`[Share] ${phase} → ${next}`);
		phase = next;
	}

	// ── Poll helpers ───────────────────────────────────────────────

	function stopPoll() {
		pollAbort?.abort();
		pollAbort = null;
	}
	function stopPendingPoll() {
		pendingPollAbort?.abort();
		pendingPollAbort = null;
	}

	// ── ICE gathering ──────────────────────────────────────────────

	function waitIce(conn: RTCPeerConnection): Promise<void> {
		return new Promise<void>((resolve) => {
			if (conn.iceGatheringState === 'complete') {
				resolve();
				return;
			}
			let done = false;
			const finish = () => {
				if (!done) {
					done = true;
					resolve();
				}
			};
			conn.addEventListener('icegatheringstatechange', () => {
				if (conn.iceGatheringState === 'complete') finish();
			});
			conn.addEventListener('icecandidate', (e) => {
				if (e.candidate === null) {
					finish(); // null = gathering complete
				} else if (e.candidate.type === 'relay' || e.candidate.type === 'srflx') {
					finish(); // good-enough candidate found, don't wait for full gathering
				}
			});
			// Absolute fallback — 3 s covers slow STUN servers
			setTimeout(finish, 3000);
		});
	}

	// ── RTCPeerConnection ──────────────────────────────────────────

	function mkPc() {
		pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
		pc.onconnectionstatechange = () => {
			const state = pc?.connectionState;
			console.log(`[Share] RTCPeerConnection state → ${state}`);
			if (state === 'failed') {
				if (sessionId) {
					const s = sessionId;
					reset();
					setTimeout(() => resumeHostSession(s), 100);
				} else {
					errorMsg = 'Connection failed';
					transition('error');
				}
			} else if (state === 'disconnected') {
				isReconnecting = true;
			} else if (state === 'connected') {
				isReconnecting = false;
				transition('connected');
			}
		};
		return pc;
	}

	function cleanupInFlight() {
		for (const [id] of inFlight) {
			const e = chat.find((c): c is MsgFile => c.id === id && c.kind === 'file');
			if (e) e.progress = -1;
		}
		inFlight.clear();
	}

	function openChannel(ch: RTCDataChannel, onConnected?: () => void) {
		dc = ch;
		const onOpen = () => {
			console.log('[Share] data channel open');
			isReconnecting = false;
			transition('connected');
			stopPoll();
			stopPendingPoll();
			if (onConnected) onConnected();
		};
		ch.onopen = onOpen;
		if (ch.readyState === 'open') onOpen();
		ch.onmessage = (e: MessageEvent) => void onMessage(e.data as string);
		ch.onclose = () => {
			console.log('[Share] data channel closed');
			cleanupInFlight();
			errorMsg = 'Connection closed by peer';
			transition('error');
		};
		ch.onerror = (e) => {
			console.error('[Share] data channel error', e);
			cleanupInFlight();
			errorMsg = 'Data channel error';
			transition('error');
		};
	}

	// ── Message handling ───────────────────────────────────────────

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
				id: nanoid(8),
				content: msg.content,
				secret: !!msg.secret,
				dir: 'in',
				ts: new Date(),
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
				progress: 0,
			});
			inFlight.set(entry.id, { meta: entry, chunks: [], total: totalChunks });
			chat.push(entry);
		} else if (msg.type === 'file-chunk') {
			const f = inFlight.get(msg.id);
			if (!f) return;
			// Use the index field to store in correct slot (fixes out-of-order corruption)
			const idx = msg.index ?? f.chunks.length;
			f.chunks[idx] = base64ToBinary(msg.data).buffer as ArrayBuffer;
			const received = f.chunks.filter(Boolean).length;
			const e = chat.find((c): c is MsgFile => c.id === msg.id && c.kind === 'file');
			if (e) e.progress = received / f.total;
		} else if (msg.type === 'file-end') {
			const f = inFlight.get(msg.id);
			if (!f) return;
			const blob = new Blob(assembleChunks(f.chunks), { type: f.meta.mimeType });
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

	// ── Host-side polling ──────────────────────────────────────────

	async function pollHost() {
		stopPoll();
		const ac = new AbortController();
		pollAbort = ac;
		console.log(`[Share] pollHost started (session=${sessionId})`);

		const result = await pollLoop(
			ac.signal,
			async () => {
				const res = await fetch(`/api/share/${sessionId}`).catch(() => null);
				if (ac.signal.aborted) return 'done';
				if (res?.status === 404) {
					console.log('[Share] pollHost: session expired');
					if (directedTo) transition('idle');
					else startSession(myName);
					return 'done';
				}
				if (!res?.ok) return 'continue';
				const data = (await res.json()) as {
					answer?: string | null;
					peerName?: string;
					guestDeviceId?: string;
					approved?: boolean;
					denied?: boolean;
				};
				// Only act on a fresh unapproved/undenied answer — prevents re-triggering
				// the approval dialog after a connection failure or reset.
				if (data.answer && !data.approved && !data.denied && phase === 'waiting') {
					console.log(`[Share] pollHost: guest answer from "${data.peerName}" (trusted=${data.guestDeviceId ? isTrustedId(data.guestDeviceId) : false})`);
					stopPoll();
					approvalPeerName = data.peerName ?? 'Guest';
					approvalPeerDeviceId = data.guestDeviceId ?? '';
					pendingAnswer = data.answer;
					if (approvalPeerDeviceId && isTrustedId(approvalPeerDeviceId)) {
						await approveGuest();
					} else {
						transition('approving');
					}
					return 'done';
				}
				return 'continue';
			},
			2000,
			30000
		);

		if (result === 'timeout') {
			console.log(`[Share] pollHost: timed out — ${directedTo ? 'returning to idle (directed)' : 'refreshing session'}`);
			if (directedTo) transition('idle');
			else startSession(myName);
		}
	}

	// ── Guest-side polling ─────────────────────────────────────────

	async function pollGuest(hostDeviceId?: string) {
		stopPoll();
		const ac = new AbortController();
		pollAbort = ac;
		console.log(`[Share] pollGuest started (session=${sessionId})`);

		const result = await pollLoop(
			ac.signal,
			async () => {
				const res = await fetch(`/api/share/${sessionId}`).catch(() => null);
				if (ac.signal.aborted) return 'done';
				if (res?.status === 404) {
					console.log('[Share] pollGuest: session closed by host');
					fail(new Error('Session closed by host'));
					return 'done';
				}
				if (!res?.ok) return 'continue';
				const data = (await res.json()) as {
					denied?: boolean;
					approved?: boolean;
					hostName?: string;
					offer?: string;
				};
				// Host refreshed — guestOffer was set from joinSession, so this comparison is reliable
				if (data.offer && data.offer !== guestOffer) {
					console.log('[Share] pollGuest: host refreshed offer — re-joining');
					stopPoll();
					void joinSession(sessionId, myName || 'Guest');
					return 'done';
				}
				if (data.denied) {
					console.log('[Share] pollGuest: connection denied by host');
					transition('denied');
					return 'done';
				}
				if (data.approved) {
					console.log('[Share] pollGuest: approved — connecting');
					transition('connecting');
					if (hostDeviceId && !isTrustedId(hostDeviceId)) {
						addTrusted(hostDeviceId, data.hostName ?? peerName);
					}
					return 'done';
				}
				return 'continue';
			},
			2000,
			30000
		);

		if (result === 'timeout') {
			console.log('[Share] pollGuest: timed out waiting for host approval');
			fail(new Error('Host did not approve in time'));
		}
	}

	// ── Pending poll (idle discovery) ──────────────────────────────

	function startPendingPollFn() {
		stopPendingPoll();
		if (!myDeviceId) return;
		const ac = new AbortController();
		pendingPollAbort = ac;

		const run = async () => {
			while (!ac.signal.aborted) {
				if (phase === 'idle') {
					const res = await fetch(`/api/share/pending?for=${myDeviceId}`).catch(() => null);
					if (!ac.signal.aborted && res?.ok) {
						const data = (await res.json()) as {
							invite: { id: string; hostName: string; hostDeviceId: string } | null;
							hosting: { id: string; peerName?: string } | null;
							nearby: { id: string; hostName: string; hostDeviceId: string }[];
						};
						nearbySessions = data.nearby;
						if (data.invite && data.invite.hostDeviceId !== myDeviceId && phase === 'idle') {
							stopPendingPoll();
							sessionId = data.invite.id;
							approvalPeerName = data.invite.hostName;
							transition('guest-invited');
							return;
						}
					}
				}
				await new Promise<void>((r) => setTimeout(r, 3000));
			}
		};
		void run();
	}

	// ── Session management ─────────────────────────────────────────

	async function startSession(name: string, targetDeviceId?: string) {
		console.log(`[Share] startSession name="${name}" directed=${targetDeviceId ?? 'broadcast'}`);
		myName = name;
		lsSet('share-name', name);
		directedTo = targetDeviceId
			? (trustedPeers.find((p) => p.id === targetDeviceId)?.name ?? '')
			: '';
		transition('offering');
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
					targetDeviceId,
				}),
			});
			if (!res.ok) throw new Error('Failed to create session');
			const { id } = (await res.json()) as { id: string };
			sessionId = id;
			shareUrl = `${window.location.origin}/share/?s=${id}`;
			console.log(`[Share] session created id=${id}`);
			transition('waiting');
			void pollHost();
		} catch (e) {
			console.error('[Share] startSession failed:', e);
			fail(e);
		}
	}

	async function joinSession(id: string, guestName: string) {
		console.log(`[Share] joinSession id=${id} name="${guestName}"`);
		stopPendingPoll();
		transition('guest-init');
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
			// Capture current offer before poll starts — avoids the race where the first tick
			// sees a changed offer but guestOffer is still '' so the comparison is skipped.
			guestOffer = data.offer;

			const hostDeviceId = data.hostDeviceId;
			transition('guest-answering');
			const conn = mkPc();
			conn.ondatachannel = (e: RTCDataChannelEvent) =>
				openChannel(e.channel, () => {
					if (hostDeviceId && !isTrustedId(hostDeviceId)) {
						addTrusted(hostDeviceId, data.hostName ?? peerName);
					}
				});
			await conn.setRemoteDescription(JSON.parse(data.offer) as RTCSessionDescriptionInit);
			await conn.setLocalDescription(await conn.createAnswer());
			await waitIce(conn);

			lsSet('share-name', guestName);
			const put = await fetch(`/api/share/${id}`, {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					answer: JSON.stringify(conn.localDescription),
					peerName: guestName,
					deviceId: myDeviceId || undefined,
				}),
			});
			if (!put.ok) {
				const body = (await put.json().catch(() => ({}))) as { message?: string };
				throw new Error(body.message ?? 'Failed to submit answer');
			}
			console.log(`[Share] answer submitted for session ${id}`);
			transition('guest-waiting');
			void pollGuest(hostDeviceId);
		} catch (e) {
			console.error('[Share] joinSession failed:', e);
			fail(e);
		}
	}

	async function resumeHostSession(id: string) {
		console.log(`[Share] resumeHostSession id=${id}`);
		sessionId = id;
		// Set shareUrl so the QR code is available as soon as the waiting screen shows.
		// (startSession sets this, but resumeHostSession is called after reset() which clears it.)
		shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/share/?s=${id}` : '';
		transition('offering');
		try {
			const conn = mkPc();
			openChannel(conn.createDataChannel('share'));
			await conn.setLocalDescription(await conn.createOffer());
			await waitIce(conn);
			await fetch(`/api/share/${id}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ offer: JSON.stringify(conn.localDescription) }),
			});
			transition('waiting');
			void pollHost();
		} catch (e) {
			console.error('[Share] resumeHostSession failed:', e);
			fail(e);
		}
	}

	async function approveGuest(remember = false) {
		console.log(`[Share] approveGuest name="${approvalPeerName}" remember=${remember}`);
		try {
			if (!pc) throw new Error('Connection not initialized');
			await fetch(`/api/share/${sessionId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ approved: true }),
			});
			await pc.setRemoteDescription(JSON.parse(pendingAnswer) as RTCSessionDescriptionInit);
			peerName = approvalPeerName;
			if (remember && approvalPeerDeviceId) addTrusted(approvalPeerDeviceId, approvalPeerName);
			transition('connecting');
		} catch (e) {
			console.error('[Share] approveGuest failed:', e);
			fail(e);
		}
	}

	async function denyGuest() {
		console.log(`[Share] denyGuest name="${approvalPeerName}"`);
		try {
			await fetch(`/api/share/${sessionId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ denied: true }),
			});
		} catch (e) {
			console.error('[Share] denyGuest failed:', e);
		}
		pendingAnswer = '';
		approvalPeerName = '';
		approvalPeerDeviceId = '';
		transition('waiting');
		void pollHost();
	}

	async function declineInvite() {
		try {
			await fetch(`/api/share/${sessionId}`, {
				method: 'PATCH',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ denied: true }),
			});
		} catch (e) {
			console.error('[Share] declineInvite failed:', e);
		}
		reset();
	}

	// ── Messaging ──────────────────────────────────────────────────

	function sendText(content: string, secret: boolean) {
		if (!dc) return;
		dc.send(JSON.stringify({ type: 'text', content, secret }));
		chat.push({ kind: 'text', id: nanoid(8), content, secret, dir: 'out', ts: new Date() });
	}

	async function sendFiles(files: File[]) {
		if (!dc) return;
		const CHUNK = 64 * 1024;
		for (const file of files) {
			const id = nanoid(8);
			const totalChunks = Math.ceil(file.size / CHUNK) || 1;
			const mimeType = file.type || 'application/octet-stream';
			const entry = $state<MsgFile>({
				kind: 'file',
				id,
				name: file.name,
				size: file.size,
				mimeType,
				dir: 'out',
				ts: new Date(),
				progress: 0,
			});
			chat.push(entry);
			dc.send(
				JSON.stringify({ type: 'file-start', id, name: file.name, size: file.size, mimeType, totalChunks })
			);
			for (let i = 0; i < totalChunks; i++) {
				if (!dc || dc.readyState !== 'open') break;
				const buf = await file.slice(i * CHUNK, (i + 1) * CHUNK).arrayBuffer();
				const data = binaryToBase64(new Uint8Array(buf));
				await waitForBuffer(dc);
				if (!dc || dc.readyState !== 'open') break;
				dc.send(JSON.stringify({ type: 'file-chunk', id, index: i, total: totalChunks, data }));
				entry.progress = (i + 1) / totalChunks;
			}
			if (dc && dc.readyState === 'open') dc.send(JSON.stringify({ type: 'file-end', id }));
			entry.blobUrl = URL.createObjectURL(file);
			if (mimeType.startsWith('text/') || mimeType === 'application/json') {
				entry.textPreview = (await file.slice(0, 1024 * 4).text())
					.split('\n')
					.slice(0, 12)
					.join('\n');
			}
		}
	}

	// ── Error / reset ──────────────────────────────────────────────

	function fail(e: unknown) {
		stopPoll();
		// Close and null pc/dc immediately so a stale ICE 'failed' event cannot fire
		// onconnectionstatechange after this point and accidentally trigger resumeHostSession.
		if (dc) {
			dc.onclose = null;
			dc.onerror = null;
			dc.onmessage = null;
			dc = null;
		}
		if (pc) {
			pc.onconnectionstatechange = null;
			pc.close();
			pc = null;
		}
		errorMsg = String(e);
		console.error('[Share] fail:', e);
		if (phase !== 'error') transition('error');
	}

	function reset() {
		console.log('[Share] reset (was phase=' + phase + ' session=' + sessionId + ')');
		if (dc) {
			dc.onclose = null;
			dc.onerror = null;
			dc.onmessage = null;
		}
		if (pc) pc.onconnectionstatechange = null;
		pc?.close();
		pc = null;
		dc = null;
		stopPoll();
		chat = [];
		sessionId = '';
		shareUrl = '';
		directedTo = '';
		guestJoinSessionId = '';
		guestOffer = '';
		inFlight.clear();
		isReconnecting = false;
		if (typeof history !== 'undefined' && window.location.search) {
			history.replaceState({}, '', window.location.pathname);
		}
		// Explicit reset bypasses transition guard — any phase → idle is valid on reset
		phase = 'idle';
		startPendingPollFn();
	}

	// ── Lifecycle ──────────────────────────────────────────────────

	function init() {
		let storedId = lsGet('share-device-id');
		if (!storedId || storedId.length < 10) {
			storedId = nanoid();
			lsSet('share-device-id', storedId);
		}
		myDeviceId = storedId;
		myName = lsGet('share-name') ?? '';
		try {
			const raw = lsGet('share-trusted');
			trustedPeers = raw ? (JSON.parse(raw) as TrustedPeer[]) : [];
		} catch {
			trustedPeers = [];
		}
	}

	function destroy() {
		stopPoll();
		stopPendingPoll();
		pc?.close();
		chat.forEach((c) => {
			if (c.kind === 'file' && c.blobUrl) URL.revokeObjectURL(c.blobUrl);
		});
	}

	/** Called from +page.svelte's $effect when ?s= param is detected in the URL. */
	function handleUrlJoin(s: string) {
		if (!s || phase !== 'idle' || !myDeviceId) return;
		guestJoinSessionId = s;
		fetch(`/api/share/${s}`)
			.then((r) => r.json())
			.then((data: { hostDeviceId?: string }) => {
				if (data.hostDeviceId === myDeviceId) {
					void resumeHostSession(s);
				} else if (myName) {
					void joinSession(s, myName);
				} else {
					transition('guest-setup');
				}
			})
			.catch(() => transition('guest-setup'));
	}

	/** Called when the guest-setup form is submitted (name entered, join clicked). */
	function startGuestSession(name: string) {
		const id = guestJoinSessionId;
		if (!id) {
			fail(new Error('Session ID not found'));
			return;
		}
		void joinSession(id, name.trim() || 'Guest');
	}

	/** Called from ShareWaiting when user manually pastes an answer link. */
	function resumeFromPastedAnswer(s: string) {
		sessionId = s;
		if (phase === 'waiting') void pollHost();
	}

	// ── Public interface ───────────────────────────────────────────

	return {
		get phase() {
			return phase;
		},
		get isReconnecting() {
			return isReconnecting;
		},
		get myName() {
			return myName;
		},
		get myDeviceId() {
			return myDeviceId;
		},
		get peerName() {
			return peerName;
		},
		get sessionId() {
			return sessionId;
		},
		get shareUrl() {
			return shareUrl;
		},
		get errorMsg() {
			return errorMsg;
		},
		get approvalPeerName() {
			return approvalPeerName;
		},
		get approvalPeerDeviceId() {
			return approvalPeerDeviceId;
		},
		get trustedPeers() {
			return trustedPeers;
		},
		get chat() {
			return chat;
		},
		get directedTo() {
			return directedTo;
		},
		get nearbySessions() {
			return nearbySessions;
		},
		isTrusted: isTrustedId,
		init,
		destroy,
		handleUrlJoin,
		startPendingPoll: startPendingPollFn,
		startSession,
		startGuestSession,
		joinSession,
		approveGuest,
		denyGuest,
		declineInvite,
		sendText,
		sendFiles,
		reset,
		removeTrusted: removeTrustedById,
		resumeFromPastedAnswer,
	};
}
