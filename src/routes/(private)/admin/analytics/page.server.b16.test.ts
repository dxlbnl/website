/**
 * B16: Guard against missing VISITOR_HASH_SALT in production — hook tests
 *
 * Acceptance criteria from wiki/specs/B16-visitor-hash-salt-guard.md:
 *
 * AC1  console.error is called when VISITOR_HASH_SALT === 'dxlb-default-salt',
 *      with a message containing the substring 'VISITOR_HASH_SALT'.
 * AC2  The pageview insert still executes when the salt is the insecure default
 *      (guard is observability-only — tracking must not be skipped).
 * AC3  console.error is NOT called when VISITOR_HASH_SALT is a non-default value.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Static mocks — hoisted by Vitest before any import resolution.
// We mock the DB and app-environment here; the env vars are controlled
// per-test using vi.doMock + vi.resetModules (see helpers below).
// ---------------------------------------------------------------------------

vi.mock('$lib/server/db', () => {
	const insertValues = vi.fn()
	const insertExecute = vi.fn(() => Promise.resolve())
	const insertChain = {
		values: insertValues,
	}
	insertValues.mockReturnValue({ execute: insertExecute })

	return {
		db: {
			insert: vi.fn(() => insertChain),
		},
	}
})

vi.mock('$app/environment', () => ({
	building: false,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a minimal SvelteKit-like event object whose request looks like an
 * HTML page response origin.  Matches the conditions in hooks.server.ts:
 *   !building && content-type includes 'text/html' && !pathname.startsWith('/api/')
 */
function makeEvent(pathname = '/notes/001-test') {
	return {
		cookies: {
			get: vi.fn(() => undefined),
			set: vi.fn(),
		},
		request: new Request(`http://localhost${pathname}`, {
			headers: { 'user-agent': 'TestBrowser/1.0' },
		}),
		url: new URL(`http://localhost${pathname}`),
		getClientAddress: () => '127.0.0.1',
	}
}

/**
 * Build a resolve function that returns an HTML response, satisfying the
 * content-type guard in the hook.
 */
function makeResolve() {
	return vi.fn((_event: unknown, opts?: { transformPageChunk?: (c: { html: string }) => string }) => {
		const html = opts?.transformPageChunk?.({ html: '<html lang="en"></html>' }) ?? '<html></html>'
		return Promise.resolve(
			new Response(html, {
				headers: { 'content-type': 'text/html; charset=utf-8' },
			}),
		)
	})
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('B16 — VISITOR_HASH_SALT guard in handle hook', () => {
	let errorSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	afterEach(() => {
		errorSpy.mockRestore()
		vi.resetModules()
	})

	// -------------------------------------------------------------------------
	// AC1 + AC3 combination: error fires only for the insecure default value
	// -------------------------------------------------------------------------

	it('AC1: calls console.error containing "VISITOR_HASH_SALT" when salt is the insecure default', async () => {
		vi.doMock('$env/static/private', () => ({
			VISITOR_HASH_SALT: 'dxlb-default-salt',
		}))

		const { handle } = await import('../../../../hooks.server.js')
		await handle({ event: makeEvent() as never, resolve: makeResolve() })

		expect(errorSpy).toHaveBeenCalled()
		const firstCallArg: unknown = errorSpy.mock.calls[0][0]
		expect(typeof firstCallArg).toBe('string')
		expect((firstCallArg as string)).toContain('VISITOR_HASH_SALT')
	})

	it('AC3: does NOT call console.error when VISITOR_HASH_SALT is a non-default value', async () => {
		vi.doMock('$env/static/private', () => ({
			VISITOR_HASH_SALT: 'my-real-secret-salt',
		}))

		const { handle } = await import('../../../../hooks.server.js')
		await handle({ event: makeEvent() as never, resolve: makeResolve() })

		expect(errorSpy).not.toHaveBeenCalled()
	})

	// -------------------------------------------------------------------------
	// AC2: tracking proceeds even when the warning fires
	// -------------------------------------------------------------------------

	it('AC2: db.insert is still called (tracking proceeds) when salt is the insecure default', async () => {
		vi.doMock('$env/static/private', () => ({
			VISITOR_HASH_SALT: 'dxlb-default-salt',
		}))

		// Re-import db mock so we can inspect the spy after the hook runs
		const { handle } = await import('../../../../hooks.server.js')
		const { db } = await import('$lib/server/db')

		await handle({ event: makeEvent() as never, resolve: makeResolve() })

		expect(db.insert).toHaveBeenCalled()
	})
})
