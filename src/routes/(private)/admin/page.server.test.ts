/**
 * B15: Admin session cookie Secure flag — regression tests
 *
 * Acceptance criteria from wiki/specs/B15-admin-cookie-secure-flag.md:
 *
 * AC1  Set-Cookie includes Secure
 * AC2  Set-Cookie includes HttpOnly
 * AC3  Set-Cookie includes SameSite=Strict
 * AC4  Set-Cookie has Path=/admin (not Path=/)
 * AC5  Set-Cookie Max-Age is 31536000
 * AC6  A failed login (wrong token) does NOT set any admin_session cookie
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock $env/static/private — must come before any module imports that read it
// ---------------------------------------------------------------------------
const TEST_ADMIN_TOKEN = 'super-secret-test-token'

vi.mock('$env/static/private', () => ({
	ADMIN_TOKEN: TEST_ADMIN_TOKEN,
}))

// ---------------------------------------------------------------------------
// Mock @sveltejs/kit so redirect() doesn't actually throw a Response that
// breaks the test, and fail() returns something we can inspect.
// ---------------------------------------------------------------------------
class RedirectError extends Error {
	status: number
	location: string
	constructor(status: number, location: string) {
		super(`Redirect ${status} -> ${location}`)
		this.status = status
		this.location = location
	}
}

vi.mock('@sveltejs/kit', () => ({
	redirect: (status: number, location: string) => {
		throw new RedirectError(status, location)
	},
	fail: (status: number, data: Record<string, unknown>) => ({ status, data }),
}))

// ---------------------------------------------------------------------------
// Mock $lib/utils/auth so createAdminSession returns a predictable value
// and we don't need a real HMAC round-trip.
// ---------------------------------------------------------------------------
const FAKE_SESSION = 'fake-nonce.fake-hmac'

vi.mock('$lib/utils/auth', () => ({
	createAdminSession: vi.fn(async () => FAKE_SESSION),
	verifyAdminSession: vi.fn(async () => false),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal Request containing a FormData `token` field. */
function makeRequest(token: string): Request {
	const fd = new FormData()
	fd.set('token', token)
	return new Request('http://localhost/admin', { method: 'POST', body: fd })
}

type CookieOpts = Record<string, unknown>

/** Minimal cookies mock that records every set() call. */
function makeCookies() {
	const calls: { name: string; value: string; opts: CookieOpts }[] = []
	return {
		set: vi.fn((name: string, value: string, opts: CookieOpts) => {
			calls.push({ name, value, opts })
		}),
		get: vi.fn(() => undefined),
		calls,
	}
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('admin login action — cookie security attributes (B15)', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('AC1: successful login sets admin_session cookie with secure: true', async () => {
		const { actions } = await import('./+page.server.js')
		const cookies = makeCookies()

		try {
			await actions.login({ request: makeRequest(TEST_ADMIN_TOKEN), cookies } as never)
		} catch (e) {
			if (!(e instanceof RedirectError)) throw e
		}

		const call = cookies.calls.find((c) => c.name === 'admin_session')
		expect(call).toBeDefined()
		expect(call!.opts.secure).toBe(true)
	})

	it('AC2: successful login sets admin_session cookie with httpOnly: true', async () => {
		const { actions } = await import('./+page.server.js')
		const cookies = makeCookies()

		try {
			await actions.login({ request: makeRequest(TEST_ADMIN_TOKEN), cookies } as never)
		} catch (e) {
			if (!(e instanceof RedirectError)) throw e
		}

		const call = cookies.calls.find((c) => c.name === 'admin_session')
		expect(call).toBeDefined()
		expect(call!.opts.httpOnly).toBe(true)
	})

	it("AC3: successful login sets admin_session cookie with sameSite: 'strict'", async () => {
		const { actions } = await import('./+page.server.js')
		const cookies = makeCookies()

		try {
			await actions.login({ request: makeRequest(TEST_ADMIN_TOKEN), cookies } as never)
		} catch (e) {
			if (!(e instanceof RedirectError)) throw e
		}

		const call = cookies.calls.find((c) => c.name === 'admin_session')
		expect(call).toBeDefined()
		expect(call!.opts.sameSite).toBe('strict')
	})

	it("AC4: successful login sets admin_session cookie with path: '/admin' (not '/')", async () => {
		const { actions } = await import('./+page.server.js')
		const cookies = makeCookies()

		try {
			await actions.login({ request: makeRequest(TEST_ADMIN_TOKEN), cookies } as never)
		} catch (e) {
			if (!(e instanceof RedirectError)) throw e
		}

		const call = cookies.calls.find((c) => c.name === 'admin_session')
		expect(call).toBeDefined()
		expect(call!.opts.path).toBe('/admin')
		expect(call!.opts.path).not.toBe('/')
	})

	it('AC5: successful login sets admin_session cookie with maxAge: 31536000', async () => {
		const { actions } = await import('./+page.server.js')
		const cookies = makeCookies()

		try {
			await actions.login({ request: makeRequest(TEST_ADMIN_TOKEN), cookies } as never)
		} catch (e) {
			if (!(e instanceof RedirectError)) throw e
		}

		const call = cookies.calls.find((c) => c.name === 'admin_session')
		expect(call).toBeDefined()
		expect(call!.opts.maxAge).toBe(60 * 60 * 24 * 365)
	})

	it('AC6: failed login (wrong token) does NOT set any admin_session cookie', async () => {
		const { actions } = await import('./+page.server.js')
		const cookies = makeCookies()

		// fail() is mocked to return — no throw expected on bad token
		await actions.login({ request: makeRequest('wrong-token'), cookies } as never)

		const adminCookieSet = cookies.calls.some((c) => c.name === 'admin_session')
		expect(adminCookieSet).toBe(false)
	})
})
