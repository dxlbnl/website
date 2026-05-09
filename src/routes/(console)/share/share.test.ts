import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	VALID_TRANSITIONS,
	isValidTransition,
	assembleChunks,
	binaryToBase64,
	base64ToBinary,
	waitForBuffer,
	pollLoop,
	AnyMsg,
	MsgTextSchema,
	MsgFileStartSchema,
	MsgFileChunkSchema,
	MsgFileEndSchema,
} from './share.svelte.ts';

// ─────────────────────────────────────────────────────────────────
// Message parsing
// ─────────────────────────────────────────────────────────────────

describe('message parsing', () => {
	it('accepts a valid text message', () => {
		const result = MsgTextSchema.safeParse({ type: 'text', content: 'hello' });
		expect(result.success).toBe(true);
	});

	it('accepts a text message with secret flag', () => {
		const result = MsgTextSchema.safeParse({ type: 'text', content: 'hi', secret: true });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.secret).toBe(true);
	});

	it('rejects text message missing content', () => {
		expect(MsgTextSchema.safeParse({ type: 'text' }).success).toBe(false);
	});

	it('accepts a valid file-start message', () => {
		const msg = { type: 'file-start', id: 'abc', name: 'file.txt', size: 1024, mimeType: 'text/plain', totalChunks: 4 };
		expect(MsgFileStartSchema.safeParse(msg).success).toBe(true);
	});

	it('rejects file-start with missing fields', () => {
		expect(MsgFileStartSchema.safeParse({ type: 'file-start', id: 'x' }).success).toBe(false);
	});

	it('accepts file-chunk with and without optional fields', () => {
		expect(MsgFileChunkSchema.safeParse({ type: 'file-chunk', id: 'x', data: 'abc' }).success).toBe(true);
		expect(MsgFileChunkSchema.safeParse({ type: 'file-chunk', id: 'x', data: 'abc', index: 2, total: 5 }).success).toBe(true);
	});

	it('accepts file-end', () => {
		expect(MsgFileEndSchema.safeParse({ type: 'file-end', id: 'x' }).success).toBe(true);
	});

	it('AnyMsg discriminated union selects correct schema', () => {
		expect(AnyMsg.safeParse({ type: 'text', content: 'hi' }).success).toBe(true);
		expect(AnyMsg.safeParse({ type: 'file-end', id: 'x' }).success).toBe(true);
	});

	it('AnyMsg rejects unknown type', () => {
		expect(AnyMsg.safeParse({ type: 'unknown', data: 'x' }).success).toBe(false);
	});
});

// ─────────────────────────────────────────────────────────────────
// Binary ↔ base64 roundtrip
// ─────────────────────────────────────────────────────────────────

describe('binaryToBase64 / base64ToBinary roundtrip', () => {
	it('survives a simple roundtrip', () => {
		const original = new Uint8Array([1, 2, 3, 255, 0, 128]);
		const encoded = binaryToBase64(original);
		const decoded = base64ToBinary(encoded);
		expect(Array.from(decoded)).toEqual(Array.from(original));
	});

	it('handles empty buffer', () => {
		const empty = new Uint8Array(0);
		expect(base64ToBinary(binaryToBase64(empty)).length).toBe(0);
	});

	it('handles a large buffer (crosses 8192-byte chunk boundary)', () => {
		const buf = new Uint8Array(10000);
		for (let i = 0; i < buf.length; i++) buf[i] = i % 256;
		const decoded = base64ToBinary(binaryToBase64(buf));
		expect(decoded.length).toBe(buf.length);
		expect(Array.from(decoded)).toEqual(Array.from(buf));
	});
});

// ─────────────────────────────────────────────────────────────────
// Chunk assembly — out-of-order delivery
// ─────────────────────────────────────────────────────────────────

describe('assembleChunks', () => {
	const make = (byte: number) => new Uint8Array([byte]).buffer as ArrayBuffer;

	it('assembles in-order chunks correctly', () => {
		const chunks = [make(1), make(2), make(3)];
		const assembled = assembleChunks(chunks);
		expect(assembled.length).toBe(3);
		expect(new Uint8Array(assembled[0])[0]).toBe(1);
		expect(new Uint8Array(assembled[2])[0]).toBe(3);
	});

	it('skips undefined holes left by missing chunks', () => {
		const sparse: (ArrayBuffer | undefined)[] = [make(1), undefined, make(3)];
		const assembled = assembleChunks(sparse);
		expect(assembled.length).toBe(2);
	});

	it('returns empty array for all-undefined input', () => {
		expect(assembleChunks([undefined, undefined])).toEqual([]);
	});

	it('correctly models out-of-order storage via indexed assignment', () => {
		// Simulate receiving chunks 2, 0, 1 (out of order)
		const chunks: (ArrayBuffer | undefined)[] = [];
		chunks[2] = make(3);
		chunks[0] = make(1);
		chunks[1] = make(2);
		const assembled = assembleChunks(chunks);
		expect(assembled.length).toBe(3);
		expect(new Uint8Array(assembled[0])[0]).toBe(1);
		expect(new Uint8Array(assembled[1])[0]).toBe(2);
		expect(new Uint8Array(assembled[2])[0]).toBe(3);
	});
});

// ─────────────────────────────────────────────────────────────────
// State machine transition guard
// ─────────────────────────────────────────────────────────────────

describe('isValidTransition', () => {
	it('allows documented transitions', () => {
		expect(isValidTransition('idle', 'offering')).toBe(true);
		expect(isValidTransition('waiting', 'approving')).toBe(true);
		expect(isValidTransition('connected', 'error')).toBe(true);
		expect(isValidTransition('error', 'idle')).toBe(true);
		expect(isValidTransition('denied', 'idle')).toBe(true);
	});

	it('blocks undocumented transitions', () => {
		expect(isValidTransition('idle', 'connected')).toBe(false);
		expect(isValidTransition('connected', 'waiting')).toBe(false);
		expect(isValidTransition('offering', 'guest-waiting')).toBe(false);
	});

	it('blocks self-transitions that are not in the table', () => {
		// A double 'connected' assignment should be a no-op
		expect(isValidTransition('connected', 'connected')).toBe(false);
	});

	it('all states are covered in VALID_TRANSITIONS', () => {
		const allStates = [
			'idle', 'offering', 'waiting', 'approving', 'guest-setup',
			'guest-init', 'guest-answering', 'guest-waiting', 'guest-invited',
			'connecting', 'connected', 'denied', 'error',
		];
		for (const s of allStates) {
			expect(VALID_TRANSITIONS[s as keyof typeof VALID_TRANSITIONS]).toBeDefined();
		}
	});
});

// ─────────────────────────────────────────────────────────────────
// waitForBuffer — absolute timeout
// ─────────────────────────────────────────────────────────────────

describe('waitForBuffer', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('resolves immediately when buffer is below threshold', async () => {
		const dc = { readyState: 'open', bufferedAmount: 0 };
		await expect(waitForBuffer(dc as unknown as RTCDataChannel, 1000)).resolves.toBeUndefined();
	});

	it('resolves immediately when dc is null', async () => {
		await expect(waitForBuffer(null, 1000)).resolves.toBeUndefined();
	});

	it('resolves when buffer drains below 2 MB', async () => {
		const dc = { readyState: 'open', bufferedAmount: 5 * 1024 * 1024 };
		const p = waitForBuffer(dc as unknown as RTCDataChannel, 1000);
		// Simulate drain after 100 ms
		setTimeout(() => { dc.bufferedAmount = 1024 * 1024; }, 100);
		await vi.advanceTimersByTimeAsync(200);
		await p;
		expect(dc.bufferedAmount).toBeLessThan(2 * 1024 * 1024);
	});

	it('resolves after timeout even when buffer never drains', async () => {
		const dc = { readyState: 'open', bufferedAmount: 10 * 1024 * 1024 };
		let resolved = false;
		const p = waitForBuffer(dc as unknown as RTCDataChannel, 500).then(() => { resolved = true; });
		await vi.advanceTimersByTimeAsync(600);
		await p;
		expect(resolved).toBe(true);
	});

	it('resolves immediately when channel closes', async () => {
		const dc = { readyState: 'closed', bufferedAmount: 10 * 1024 * 1024 };
		await expect(waitForBuffer(dc as unknown as RTCDataChannel, 5000)).resolves.toBeUndefined();
	});
});

// ─────────────────────────────────────────────────────────────────
// pollLoop — non-overlapping, abort-aware
// ─────────────────────────────────────────────────────────────────

describe('pollLoop', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('returns "done" when tick resolves done', async () => {
		const ac = new AbortController();
		const tick = vi.fn().mockResolvedValue('done');
		const p = pollLoop(ac.signal, tick, 100, 5000);
		await vi.runAllTimersAsync();
		expect(await p).toBe('done');
		expect(tick).toHaveBeenCalledTimes(1);
	});

	it('returns "timeout" after timeoutMs', async () => {
		const ac = new AbortController();
		const tick = vi.fn().mockResolvedValue('continue');
		const p = pollLoop(ac.signal, tick, 100, 1000);
		await vi.advanceTimersByTimeAsync(1200);
		expect(await p).toBe('timeout');
	});

	it('returns "aborted" when signal is aborted before first tick', async () => {
		const ac = new AbortController();
		ac.abort();
		const tick = vi.fn().mockResolvedValue('continue');
		expect(await pollLoop(ac.signal, tick, 100, 5000)).toBe('aborted');
		expect(tick).not.toHaveBeenCalled();
	});

	it('returns "aborted" when signal is aborted between ticks', async () => {
		const ac = new AbortController();
		let calls = 0;
		const tick = vi.fn().mockImplementation(async () => {
			calls++;
			if (calls === 2) ac.abort();
			return 'continue' as const;
		});
		const p = pollLoop(ac.signal, tick, 100, 5000);
		await vi.advanceTimersByTimeAsync(500);
		expect(await p).toBe('aborted');
		expect(tick).toHaveBeenCalledTimes(2);
	});

	it('does not overlap ticks — next tick waits for previous to finish', async () => {
		const ac = new AbortController();
		let concurrent = 0;
		let maxConcurrent = 0;
		const tick = vi.fn().mockImplementation(async () => {
			concurrent++;
			maxConcurrent = Math.max(maxConcurrent, concurrent);
			await new Promise<void>((r) => setTimeout(r, 150)); // tick takes longer than interval
			concurrent--;
			return 'continue' as const;
		});
		const p = pollLoop(ac.signal, tick, 100, 1000);
		// Run all timers until pollLoop times out and stops creating new timers
		await vi.runAllTimersAsync();
		await p;
		expect(maxConcurrent).toBe(1); // never more than 1 tick running at once
	});

	it('handles tick errors gracefully (treats as continue)', async () => {
		const ac = new AbortController();
		let calls = 0;
		const tick = vi.fn().mockImplementation(async () => {
			calls++;
			if (calls === 1) throw new Error('fetch failed');
			return 'done' as const;
		});
		const p = pollLoop(ac.signal, tick, 100, 5000);
		await vi.runAllTimersAsync();
		expect(await p).toBe('done');
		expect(tick).toHaveBeenCalledTimes(2);
	});
});
