/**
 * Integration tests for createShare() — scenario-level coverage.
 *
 * Uses fake timers so no test waits 30 real seconds.
 * Uses mock RTCPeerConnection, localStorage, and fetch so no browser is needed.
 *
 * File naming: *.test.ts → runs in the Vitest "server" project (Node env).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createShare } from './share.svelte.ts';

// ─────────────────────────────────────────────────────────────────
// Mock RTCPeerConnection / RTCDataChannel
// ─────────────────────────────────────────────────────────────────

class MockDataChannel {
	readyState: 'connecting' | 'open' | 'closed' = 'connecting';
	bufferedAmount = 0;
	onopen: (() => void) | null = null;
	onclose: (() => void) | null = null;
	onerror: ((e: Event) => void) | null = null;
	onmessage: ((e: { data: string }) => void) | null = null;
	sent: string[] = [];

	send(data: string) {
		this.sent.push(data);
	}
	triggerOpen() {
		this.readyState = 'open';
		this.onopen?.();
	}
	triggerClose() {
		this.readyState = 'closed';
		this.onclose?.();
	}
	simulateReceive(data: unknown) {
		this.onmessage?.({ data: typeof data === 'string' ? data : JSON.stringify(data) });
	}
}

class MockPeerConnection {
	iceGatheringState: RTCIceGatheringState = 'complete'; // skip waitIce
	connectionState: RTCPeerConnectionState = 'new';
	localDescription: RTCSessionDescriptionInit | null = null;
	remoteDescription: RTCSessionDescriptionInit | null = null;
	onconnectionstatechange: ((e: Event) => void) | null = null;
	ondatachannel: ((e: { channel: MockDataChannel }) => void) | null = null;
	_dc: MockDataChannel | null = null;

	static last: MockPeerConnection;

	constructor(_config?: unknown) {
		MockPeerConnection.last = this;
	}
	createDataChannel(_label: string) {
		this._dc = new MockDataChannel();
		return this._dc;
	}
	async createOffer(): Promise<RTCSessionDescriptionInit> {
		return { type: 'offer', sdp: 'mock-offer-sdp' };
	}
	async createAnswer(): Promise<RTCSessionDescriptionInit> {
		return { type: 'answer', sdp: 'mock-answer-sdp' };
	}
	async setLocalDescription(d: RTCSessionDescriptionInit) {
		this.localDescription = d;
	}
	async setRemoteDescription(d: RTCSessionDescriptionInit) {
		this.remoteDescription = d;
	}
	addEventListener(_type: string, _h: unknown) {}
	removeEventListener(_type: string, _h: unknown) {}
	triggerConnectionState(state: RTCPeerConnectionState) {
		this.connectionState = state;
		this.onconnectionstatechange?.(new Event('connectionstatechange'));
	}
	fireDataChannel(channel: MockDataChannel) {
		this.ondatachannel?.({ channel });
	}
	close() {}
}

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

/** Flush all queued microtasks (enough levels for nested awaits). */
const flushMicrotasks = async () => {
	for (let i = 0; i < 30; i++) await Promise.resolve();
};

/** Advance fake clock by one 2-second poll interval and flush microtasks. */
const tickPoll = async (times = 1) => {
	for (let i = 0; i < times; i++) {
		await vi.advanceTimersByTimeAsync(2000);
		await flushMicrotasks();
	}
};

function makeLocalStorage() {
	const store = new Map<string, string>();
	return {
		getItem: (k: string) => store.get(k) ?? null,
		setItem: (k: string, v: string) => store.set(k, v),
		removeItem: (k: string) => store.delete(k),
		clear: () => store.clear(),
		_store: store,
	};
}

/** A minimal JSON SDP string that share.svelte.ts can JSON.parse. */
const mockOffer = JSON.stringify({ type: 'offer', sdp: 'mock-offer-sdp' });

// ─────────────────────────────────────────────────────────────────
// Global setup / teardown
// ─────────────────────────────────────────────────────────────────

let mockFetch: ReturnType<typeof vi.fn>;
let mockLs: ReturnType<typeof makeLocalStorage>;

beforeEach(() => {
	vi.useFakeTimers();

	mockLs = makeLocalStorage();
	vi.stubGlobal('localStorage', mockLs);
	vi.stubGlobal('RTCPeerConnection', MockPeerConnection);

	mockFetch = vi.fn();
	vi.stubGlobal('fetch', mockFetch);

	vi.stubGlobal('URL', {
		createObjectURL: vi.fn(() => 'blob:mock'),
		revokeObjectURL: vi.fn(),
	});
	vi.stubGlobal('window', { location: { origin: 'https://test.local', search: '' } });
	vi.stubGlobal('history', { replaceState: vi.fn() });
	vi.stubGlobal('Blob', class MockBlob {
		type: string;
		_parts: unknown[];
		constructor(parts: unknown[], opts?: { type?: string }) {
			this._parts = parts;
			this.type = opts?.type ?? '';
		}
		text() { return Promise.resolve(''); }
	});
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

// ─────────────────────────────────────────────────────────────────
// Factory helpers
// ─────────────────────────────────────────────────────────────────

function makeShare(opts?: {
	deviceId?: string;
	name?: string;
	trusted?: { id: string; name: string }[];
}) {
	if (opts?.deviceId) mockLs.setItem('share-device-id', opts.deviceId);
	if (opts?.name) mockLs.setItem('share-name', opts.name);
	if (opts?.trusted) mockLs.setItem('share-trusted', JSON.stringify(opts.trusted));
	const share = createShare();
	share.init();
	return share;
}

/** Builds a fetch mock for host-side tests. */
function hostFetch(
	sessionState: () => {
		answer?: string | null;
		peerName?: string;
		guestDeviceId?: string;
		approved?: boolean;
		denied?: boolean;
	},
	sessionId = 'sess-1'
) {
	return vi.fn((url: string, init?: { method?: string; body?: string }) => {
		const method = init?.method ?? 'GET';
		if (url === '/api/share' && method === 'POST') {
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: sessionId }) });
		}
		if (url.includes(`/api/share/${sessionId}`)) {
			if (method === 'GET') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve(sessionState()) });
			}
			if (method === 'PATCH') {
				const body = JSON.parse(init?.body ?? '{}') as Record<string, unknown>;
				const s = sessionState();
				if (body.approved) s.approved = true;
				if (body.denied) s.denied = true;
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
			}
		}
		return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
	});
}

// ─────────────────────────────────────────────────────────────────
// Host flow
// ─────────────────────────────────────────────────────────────────

describe('host flow', () => {
	it('init creates and persists a device ID', () => {
		const share = makeShare({ deviceId: 'existing-device-001234' });
		expect(share.myDeviceId).toBe('existing-device-001234');
		expect(share.phase).toBe('idle');
	});

	it('startSession transitions offering → waiting and stores shareUrl', async () => {
		mockFetch = hostFetch(() => ({ answer: null, approved: false, denied: false }));
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks();

		expect(share.phase).toBe('waiting');
		expect(share.shareUrl).toContain('sess-1');
	});

	it('guest answer triggers approving phase', async () => {
		const state = { answer: null as string | null, approved: false, denied: false, peerName: 'Bob', guestDeviceId: 'bob-dev-0001234' };
		mockFetch = hostFetch(() => state);
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks(); // first tick — no answer yet

		state.answer = 'mock-guest-answer-sdp';
		await tickPoll(); // second tick — answer arrives

		expect(share.phase).toBe('approving');
		expect(share.approvalPeerName).toBe('Bob');
	});

	it('host does NOT re-show approval dialog for already-approved sessions (bug fix)', async () => {
		// Session already has answer=true AND approved=true (e.g. after a reconnect).
		// The poll must ignore it — no re-triggering of the approval dialog.
		const state = { answer: 'mock-answer', approved: true, denied: false, peerName: 'Bob', guestDeviceId: 'bob-0001234' };
		mockFetch = hostFetch(() => state);
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks();

		await tickPoll(3); // three ticks, each sees approved=true — must stay 'waiting'

		expect(share.phase).toBe('waiting');
	});

	it('CS-1: poll timeout refreshes session instead of erroring', async () => {
		let postCount = 0;
		mockFetch = vi.fn((url: string, init?: { method?: string }) => {
			if (url === '/api/share' && init?.method === 'POST') {
				postCount++;
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: `sess-${postCount}` }) });
			}
			// Never returns an answer
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ answer: null, approved: false, denied: false }) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks();

		expect(share.phase).toBe('waiting');
		expect(share.sessionId).toBe('sess-1');

		// Advance past the 30-second timeout (deadline + one interval = 32 s)
		await vi.advanceTimersByTimeAsync(32000);
		await flushMicrotasks();

		// A second session must have been created — phase never became 'error'
		expect(postCount).toBe(2);
		expect(share.sessionId).toBe('sess-2');
		expect(share.phase).toBe('waiting');
	});

	it('CS-2: deny returns host to waiting with fresh poll, not error', async () => {
		const state = { answer: null as string | null, approved: false, denied: false, peerName: 'Bob', guestDeviceId: 'bob-0001234' };
		mockFetch = hostFetch(() => state);
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks();

		// Bob arrives
		state.answer = 'mock-answer';
		await tickPoll();
		expect(share.phase).toBe('approving');

		// Alice denies
		await share.denyGuest();
		await flushMicrotasks();

		expect(share.phase).toBe('waiting');

		// Next poll tick sees denied session — must NOT re-trigger approving
		state.denied = true; // server now marks it denied
		await tickPoll();
		expect(share.phase).toBe('waiting');
	});

	it('after deny, a second guest can still get approved', async () => {
		// Simulates: A denies B → C submits answer → server clears denied flag → A sees C
		const state = { answer: null as string | null, approved: false, denied: false, peerName: '', guestDeviceId: '' };
		mockFetch = hostFetch(() => state);
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks();

		// Bob arrives, gets denied
		state.answer = 'bob-answer'; state.peerName = 'Bob'; state.guestDeviceId = 'bob-0001234';
		await tickPoll();
		expect(share.phase).toBe('approving');
		await share.denyGuest();
		await flushMicrotasks();

		// Server clears denied when Carol submits (PUT handler clears denied=false)
		state.answer = 'carol-answer';
		state.peerName = 'Carol';
		state.guestDeviceId = 'carol-0001234';
		state.denied = false; // ← server cleared it on Carol's PUT

		await tickPoll();
		expect(share.phase).toBe('approving');
		expect(share.approvalPeerName).toBe('Carol');
	});

	it('TR-1: trusted guest is auto-approved without the approving dialog', async () => {
		const bobId = 'bob-trusted-0001234';
		// answer must be a JSON-serialised SDP — approveGuest() calls JSON.parse(pendingAnswer)
		const state = { answer: JSON.stringify({ type: 'answer', sdp: 'mock-sdp' }), approved: false, denied: false, peerName: 'Bob', guestDeviceId: bobId };
		mockFetch = hostFetch(() => state);
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({
			deviceId: 'host-device-001234',
			name: 'Alice',
			trusted: [{ id: bobId, name: 'Bob' }],
		});
		await share.startSession('Alice');
		await flushMicrotasks();

		// Tick — Bob's answer arrives; trusted → auto-approve
		await tickPoll();
		await flushMicrotasks();

		// Should skip 'approving' and go straight to 'connecting'
		expect(share.phase).not.toBe('approving');
		expect(['connecting', 'connected']).toContain(share.phase);
	});
});

// ─────────────────────────────────────────────────────────────────
// Guest flow
// ─────────────────────────────────────────────────────────────────

describe('guest flow', () => {
	function guestFetch(
		sessionData: {
			offer?: string;
			hostName?: string;
			hostDeviceId?: string;
			approved?: boolean;
			denied?: boolean;
		} = {}
	) {
		return vi.fn((url: string, init?: { method?: string }) => {
			const method = init?.method ?? 'GET';
			if (url.includes('/api/share/') && method === 'GET') {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({
						offer: mockOffer,
						hostName: 'Alice',
						hostDeviceId: 'alice-dev-001234',
						...sessionData,
					}),
				});
			}
			if (url.includes('/api/share/') && method === 'PUT') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
	}

	it('joinSession transitions through guest-init → guest-answering → guest-waiting', async () => {
		mockFetch = guestFetch();
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		const p = share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();
		await p;
		await flushMicrotasks();

		expect(share.phase).toBe('guest-waiting');
	});

	it('data channel opening while in guest-waiting goes directly to connected (bug fix)', async () => {
		// THE CORE BUG: ICE completes and the data channel fires onopen before the next
		// poll tick returns approved:true. Previously this transition was blocked.
		mockFetch = guestFetch();
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		await share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();

		expect(share.phase).toBe('guest-waiting');

		// Simulate: host approved → ICE completes → ondatachannel fires → onopen fires
		const mockPc = MockPeerConnection.last;
		const guestDc = new MockDataChannel();
		mockPc.fireDataChannel(guestDc); // triggers ondatachannel → openChannel(guestDc)
		guestDc.triggerOpen();           // triggers onOpen → transition('connected')

		expect(share.phase).toBe('connected');
	});

	it('CS-5: guest poll timeout results in error, host session is unaffected', async () => {
		// Guest side — poll never gets approved/denied → timeout → error
		mockFetch = guestFetch({ approved: false, denied: false });
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		await share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();

		expect(share.phase).toBe('guest-waiting');

		// Advance past 30s timeout (32s to be safe)
		await vi.advanceTimersByTimeAsync(32000);
		await flushMicrotasks();

		expect(share.phase).toBe('error');
		expect(share.errorMsg).toContain('approve');
	});

	it('guest poll approved transition works when poll fires before channel opens', async () => {
		// Opposite race: poll fires approved:true BEFORE ondatachannel opens
		const state = { approved: false, denied: false };
		mockFetch = vi.fn((_url: string, init?: { method?: string }) => {
			const method = init?.method ?? 'GET';
			if (method === 'GET') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ offer: mockOffer, hostName: 'Alice', hostDeviceId: 'alice-dev-001234', ...state }) });
			}
			if (method === 'PUT') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		await share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();
		expect(share.phase).toBe('guest-waiting');

		state.approved = true;
		await tickPoll(); // poll fires → approved:true → transition('connecting')

		expect(share.phase).toBe('connecting');

		// Data channel now opens (after the poll)
		const mockPc = MockPeerConnection.last;
		const guestDc = new MockDataChannel();
		mockPc.fireDataChannel(guestDc);
		guestDc.triggerOpen();

		expect(share.phase).toBe('connected');
	});

	it('guest sees denied when host denies', async () => {
		const state = { approved: false, denied: false };
		mockFetch = vi.fn((_url: string, init?: { method?: string }) => {
			const method = init?.method ?? 'GET';
			if (method === 'GET') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ offer: mockOffer, ...state }) });
			}
			if (method === 'PUT') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		await share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();

		state.denied = true;
		await tickPoll();

		expect(share.phase).toBe('denied');
	});
});

// ─────────────────────────────────────────────────────────────────
// Connected state
// ─────────────────────────────────────────────────────────────────

describe('connected state', () => {
	/** Convenience: get share into 'connected' state via the guest path. */
	async function makeConnectedShare() {
		mockFetch = vi.fn((_url: string, init?: { method?: string }) => {
			const method = init?.method ?? 'GET';
			if (method === 'GET') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ offer: mockOffer, hostName: 'Alice', hostDeviceId: 'alice-dev-001234' }) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		await share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();

		const mockPc = MockPeerConnection.last;
		const dc = new MockDataChannel();
		mockPc.fireDataChannel(dc);
		dc.triggerOpen();

		expect(share.phase).toBe('connected');
		return { share, dc };
	}

	it('CO-3: in-flight file gets progress=-1 when channel closes mid-transfer', async () => {
		const { share, dc } = await makeConnectedShare();

		dc.simulateReceive({
			type: 'file-start',
			id: 'file-abc',
			name: 'photo.jpg',
			size: 50000,
			mimeType: 'image/jpeg',
			totalChunks: 5,
		});
		await flushMicrotasks();

		const fileEntry = share.chat.find((c) => c.kind === 'file' && c.id === 'file-abc');
		expect(fileEntry).toBeDefined();
		expect(fileEntry?.kind === 'file' && fileEntry.progress).toBe(0);

		// Channel closes before transfer completes
		dc.triggerClose();

		expect(share.phase).toBe('error');
		const fileAfter = share.chat.find((c) => c.kind === 'file' && c.id === 'file-abc');
		expect(fileAfter?.kind === 'file' && fileAfter.progress).toBe(-1);
	});

	it('received text message appears in chat', async () => {
		const { share, dc } = await makeConnectedShare();

		dc.simulateReceive({ type: 'text', content: 'hello world', secret: false });
		await flushMicrotasks();

		const msg = share.chat.find((c) => c.kind === 'text' && c.dir === 'in');
		expect(msg).toBeDefined();
		expect(msg?.kind === 'text' && msg.content).toBe('hello world');
	});

	it('out-of-order chunks are assembled correctly', async () => {
		const { share, dc } = await makeConnectedShare();

		dc.simulateReceive({ type: 'file-start', id: 'f1', name: 'data.bin', size: 3, mimeType: 'application/octet-stream', totalChunks: 3 });
		await flushMicrotasks();

		// Arrive out of order: chunk 2 first, then 0, then 1
		const btoa = (s: string) => Buffer.from(s, 'binary').toString('base64');
		dc.simulateReceive({ type: 'file-chunk', id: 'f1', index: 2, total: 3, data: btoa('\x03') });
		dc.simulateReceive({ type: 'file-chunk', id: 'f1', index: 0, total: 3, data: btoa('\x01') });
		dc.simulateReceive({ type: 'file-chunk', id: 'f1', index: 1, total: 3, data: btoa('\x02') });

		await flushMicrotasks();

		// Receive file-end — blob is assembled
		dc.simulateReceive({ type: 'file-end', id: 'f1' });
		await flushMicrotasks();

		const file = share.chat.find((c) => c.kind === 'file' && c.id === 'f1');
		expect(file?.kind === 'file' && file.progress).toBe(1);
		// blobUrl set means assembly completed
		expect(file?.kind === 'file' && file.blobUrl).toBe('blob:mock');
	});

	it('CO-5: isReconnecting flag is set on disconnected, cleared on connected', async () => {
		const { share } = await makeConnectedShare();
		const pc = MockPeerConnection.last;

		pc.triggerConnectionState('disconnected');
		expect(share.isReconnecting).toBe(true);

		pc.triggerConnectionState('connected');
		expect(share.isReconnecting).toBe(false);
	});
});

// ─────────────────────────────────────────────────────────────────
// State machine guard — double-fire protection
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// Regression: "Error: already connected" loop
// ─────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────
// Regression: laptop invites itself via pending poll
// ─────────────────────────────────────────────────────────────────

describe('regression: device must not receive own broadcast sessions as invites', () => {
	it('pending poll with own session as broadcast returns no invite', async () => {
		// The broadcastInvite query must exclude sessions where hostDeviceId = forDevice.
		// Before the fix, a device hosting a broadcast session would discover its own
		// session as an invite → idle → guest-invited → reset loop.
		mockFetch = vi.fn((url: string) => {
			if (url.includes('/api/share/pending')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({
						// Server correctly returns no invite for own sessions
						invite: null,
						hosting: { id: 'sess-own', peerName: null, hasAnswer: null },
						nearby: [],
					}),
				});
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'laptop-device-001234', name: 'Laptop' });
		share.startPendingPoll();

		// Let one pending poll tick run (3s interval)
		await vi.advanceTimersByTimeAsync(3000);
		await flushMicrotasks();

		// Phase must stay idle — no self-invite
		expect(share.phase).toBe('idle');
	});

	it('client-side guard: skips invite where hostDeviceId === myDeviceId even if server returns it', async () => {
		// Belt-and-suspenders: even if the server mis-returns an invite for a session
		// we are hosting, the client must not act on it.
		mockFetch = vi.fn((url: string) => {
			if (url.includes('/api/share/pending')) {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({
						invite: { id: 'own-sess', hostName: 'Laptop', hostDeviceId: 'laptop-device-001234' },
						hosting: null,
						nearby: [],
					}),
				});
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'laptop-device-001234', name: 'Laptop' });
		share.startPendingPoll();

		await vi.advanceTimersByTimeAsync(3000);
		await flushMicrotasks();

		expect(share.phase).toBe('idle');
	});
});

describe('regression: already-connected 409 loop', () => {
	it('fail() closes pc so a late ICE failure does not trigger resumeHostSession', async () => {
		// Scenario: guest tries to join a session that is already connected (409).
		// fail() is called. Later (~30s) the guest's RTCPeerConnection reaches
		// 'failed' (ICE gave up). Before this fix, onconnectionstatechange would
		// fire resumeHostSession, putting the guest into 'waiting' with no QR.
		mockFetch = vi.fn((url: string, init?: { method?: string }) => {
			const method = init?.method ?? 'GET';
			if (url.includes('/api/share/') && method === 'GET') {
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ offer: mockOffer, hostName: 'Alice', hostDeviceId: 'alice-dev-001234' }),
				});
			}
			if (url.includes('/api/share/') && method === 'PUT') {
				return Promise.resolve({
					ok: false,
					status: 409,
					json: () => Promise.resolve({ message: 'Session already connected' }),
				});
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		await share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();

		expect(share.phase).toBe('error');
		expect(share.errorMsg).toContain('already connected');

		// Capture the PC that fail() should have already closed/nulled
		const stalePC = MockPeerConnection.last;

		// Simulate the late ICE failure arriving after fail() has cleaned up
		stalePC.triggerConnectionState('failed');
		await vi.advanceTimersByTimeAsync(150); // covers the 100ms setTimeout
		await flushMicrotasks();

		// Must stay in error — NOT flip to 'waiting' (the old bug)
		expect(share.phase).toBe('error');
	});

	it('resumeHostSession sets shareUrl so the QR is visible after host reconnect', async () => {
		// When a connection fails, the host side calls reset() then resumeHostSession().
		// reset() clears shareUrl, so resumeHostSession must restore it.
		let postCount = 0;
		mockFetch = vi.fn((url: string, init?: { method?: string }) => {
			const method = init?.method ?? 'GET';
			if (url === '/api/share' && method === 'POST') {
				postCount++;
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'sess-1' }) });
			}
			if (url.includes('/api/share/sess-1')) {
				if (method === 'PATCH') {
					return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
				}
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ answer: null, approved: false, denied: false }) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks();

		expect(share.shareUrl).toContain('sess-1');

		const pc = MockPeerConnection.last;

		// Connection fails → reset() clears shareUrl → resumeHostSession fires after 100ms
		pc.triggerConnectionState('failed');
		expect(share.shareUrl).toBe(''); // cleared by reset()

		await vi.advanceTimersByTimeAsync(200);
		await flushMicrotasks();

		// resumeHostSession must have restored shareUrl
		expect(share.shareUrl).toContain('sess-1');
		expect(share.phase).toBe('waiting');
	});
});

describe('state machine guard', () => {
	it('double connected fires do not corrupt phase', async () => {
		mockFetch = vi.fn((_url: string, init?: { method?: string }) => {
			const method = init?.method ?? 'GET';
			if (method === 'GET') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ offer: mockOffer }) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'guest-device-001234', name: 'Bob' });
		await share.joinSession('session-abc', 'Bob');
		await flushMicrotasks();

		const mockPc = MockPeerConnection.last;
		const dc = new MockDataChannel();
		mockPc.fireDataChannel(dc);
		dc.triggerOpen(); // first → 'guest-waiting' → 'connected' ✓

		expect(share.phase).toBe('connected');

		// Second fire — should be a no-op (connected → connected is not in VALID_TRANSITIONS)
		dc.triggerOpen();
		mockPc.triggerConnectionState('connected');

		expect(share.phase).toBe('connected'); // unchanged, no throw
	});

	it('reset clears sessionId and shareUrl', async () => {
		mockFetch = vi.fn((url: string, init?: { method?: string }) => {
			if (url === '/api/share' && init?.method === 'POST') {
				return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 'sess-xyz' }) });
			}
			return Promise.resolve({ ok: true, json: () => Promise.resolve({ answer: null, approved: false, denied: false }) });
		});
		vi.stubGlobal('fetch', mockFetch);

		const share = makeShare({ deviceId: 'host-device-001234', name: 'Alice' });
		await share.startSession('Alice');
		await flushMicrotasks();

		expect(share.sessionId).toBe('sess-xyz');
		expect(share.shareUrl).toContain('sess-xyz');

		share.reset();

		expect(share.sessionId).toBe('');
		expect(share.shareUrl).toBe('');
		expect(share.phase).toBe('idle');
	});
});
