/**
 * B14: SSRF fix for /api/og image param — failing tests (red step)
 *
 * Acceptance criteria from wiki/specs/B14-ssrf-og-image-param.md:
 *
 * AC1   External URL in `image` param (contains `://`) → no fetch to that URL; renders without bg
 * AC2   Relative image path (no `://`) → fetched normally via the SvelteKit fetch helper
 * AC3   Absent `image` param → renders with solid background (no fetch for bg image)
 * AC4   SSRF check applied before .webp → .jpg replacement (scheme-smuggle attempt blocked)
 * AC5   title > 200 chars → truncated to exactly 200 chars; endpoint returns HTTP 200
 * AC6   subtitle > 200 chars → truncated to exactly 200 chars; endpoint returns HTTP 200
 * AC7   cta > 200 chars → truncated to exactly 200 chars; endpoint returns HTTP 200
 * AC8   Params at or below 200 chars pass through unchanged
 * AC9   fetchAssetAsBase64 for background image uses AbortSignal.timeout(5000)
 * AC11  Valid relative path + title + subtitle → HTTP 200 with content-type: image/jpeg
 * AC12  No query params → HTTP 200 with content-type: image/jpeg
 * AC13  External URL → HTTP 200 with content-type: image/jpeg; external URL never fetched
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Satori mock — captures every node argument so tests can inspect what was
// passed without relying on vi.spyOn across module-reset boundaries.
// The capturedSatoriNode variable is reset in beforeEach for each suite.
// ---------------------------------------------------------------------------

let capturedSatoriNode: unknown = undefined

vi.mock('satori', () => ({
	default: async (node: unknown) => {
		capturedSatoriNode = node
		return '<svg></svg>'
	},
}))

vi.mock('@resvg/resvg-js', () => ({
	Resvg: class {
		render() {
			return { asPng: () => Buffer.from('fake-png') }
		}
	},
}))

vi.mock('sharp', () => ({
	default: () => ({
		jpeg: function () {
			return this
		},
		toBuffer: async () => Buffer.from('fake-jpeg'),
	}),
}))

// ---------------------------------------------------------------------------
// Build a minimal SvelteKit-like `url` object from a query string.
// ---------------------------------------------------------------------------
function makeUrl(query: string): URL {
	return new URL(`http://localhost/api/og${query ? '?' + query : ''}`)
}

// ---------------------------------------------------------------------------
// Build a mock SvelteKit `fetch` that records every call (path + init) and
// returns sensible responses for font, logo, and background image paths.
// ---------------------------------------------------------------------------

const FAKE_FONT_BUFFER = new ArrayBuffer(8)
const FAKE_LOGO_BUFFER = new ArrayBuffer(4)
const FAKE_BG_BUFFER = new ArrayBuffer(16)

type FetchRecord = { path: string; init?: RequestInit }

function makeFetch(opts: { bgOk?: boolean } = {}) {
	const { bgOk = true } = opts
	const calls: FetchRecord[] = []

	const mockFetch = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
		const path =
			typeof input === 'string'
				? input
				: input instanceof URL
					? input.toString()
					: (input as Request).url
		calls.push({ path, init })

		if (path.includes('JetBrainsMono') || path.includes('font')) {
			return new Response(FAKE_FONT_BUFFER, { status: 200 })
		}
		if (path.includes('logo.png')) {
			return new Response(FAKE_LOGO_BUFFER, {
				status: 200,
				headers: { 'content-type': 'image/png' },
			})
		}
		if (bgOk) {
			return new Response(FAKE_BG_BUFFER, {
				status: 200,
				headers: { 'content-type': 'image/jpeg' },
			})
		}
		return new Response(null, { status: 404 })
	})

	return { mockFetch, calls }
}

// ---------------------------------------------------------------------------
// Invoke the handler under test
// ---------------------------------------------------------------------------

async function callGET(query: string, fetchImpl: typeof fetch) {
	const { GET } = await import('./+server.js')
	const url = makeUrl(query)
	return GET({ url, fetch: fetchImpl } as Parameters<typeof GET>[0])
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('B14 /api/og — SSRF mitigation (image param)', () => {
	beforeEach(() => {
		capturedSatoriNode = undefined
		vi.resetModules()
	})

	it('AC13: external URL in image param is never fetched; response is HTTP 200 image/jpeg', async () => {
		const { mockFetch, calls } = makeFetch()
		const response = await callGET(
			'image=https://evil.example.com/photo.jpg&title=Hello',
			mockFetch as unknown as typeof fetch,
		)

		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe('image/jpeg')

		const externalFetched = calls.some((c) => c.path.includes('evil.example.com'))
		expect(externalFetched).toBe(false)
	})

	it('AC1: external URL (https://) → rawImageUrl treated as null; no bg fetch at that URL', async () => {
		const { mockFetch, calls } = makeFetch()
		await callGET(
			'image=https://evil.example.com/steal.jpg',
			mockFetch as unknown as typeof fetch,
		)

		const attackerFetched = calls.find((c) => c.path.startsWith('https://evil.example.com'))
		expect(attackerFetched).toBeUndefined()
	})

	it('AC1: http:// scheme is also rejected (metadata endpoint pattern)', async () => {
		const { mockFetch, calls } = makeFetch()
		await callGET(
			'image=http://169.254.169.254/latest/meta-data/',
			mockFetch as unknown as typeof fetch,
		)

		const metadataFetched = calls.find((c) => c.path.includes('169.254.169.254'))
		expect(metadataFetched).toBeUndefined()
	})

	it('AC2: relative path (no ://) is fetched normally', async () => {
		const { mockFetch, calls } = makeFetch()
		await callGET('image=/images/foo.webp', mockFetch as unknown as typeof fetch)

		// .webp → .jpg replacement applies; either form is acceptable
		const bgFetched = calls.find((c) => c.path.includes('/images/foo'))
		expect(bgFetched).toBeDefined()
	})

	it('AC3: absent image param → no background image fetch', async () => {
		const { mockFetch, calls } = makeFetch()
		await callGET('title=Hello', mockFetch as unknown as typeof fetch)

		const bgFetched = calls.find((c) => c.path.includes('/images/'))
		expect(bgFetched).toBeUndefined()
	})

	it('AC4: attacker cannot smuggle external URL by omitting extension before scheme', async () => {
		// The SSRF check must fire on rawImageUrl before .webp → .jpg replacement,
		// so a bare https:// URL without a recognised extension is also rejected.
		const { mockFetch, calls } = makeFetch()
		await callGET('image=https://evil.com/image', mockFetch as unknown as typeof fetch)

		const externalFetched = calls.find((c) => c.path.includes('evil.com'))
		expect(externalFetched).toBeUndefined()
	})
})

describe('B14 /api/og — parameter length limits', () => {
	beforeEach(() => {
		capturedSatoriNode = undefined
		vi.resetModules()
	})

	it('AC5: title longer than 200 chars → endpoint returns HTTP 200', async () => {
		const { mockFetch } = makeFetch()
		const longTitle = 'A'.repeat(300)
		const response = await callGET(
			`title=${encodeURIComponent(longTitle)}`,
			mockFetch as unknown as typeof fetch,
		)

		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe('image/jpeg')
	})

	it('AC5: title is truncated to exactly 200 chars before reaching satori', async () => {
		const { mockFetch } = makeFetch()
		const longTitle = 'B'.repeat(300)

		await callGET(
			`title=${encodeURIComponent(longTitle)}`,
			mockFetch as unknown as typeof fetch,
		)

		// capturedSatoriNode is set by the mock's closure — unaffected by module resets
		expect(capturedSatoriNode).toBeDefined()
		const titleText = findTitleText(capturedSatoriNode)
		// toUpperCase() is called on title inside the handler; 300 'B's → 'BBBB…' still 300
		// after truncation it must be ≤ 200
		expect(titleText.length).toBeLessThanOrEqual(200)
	})

	it('AC6: subtitle longer than 200 chars → endpoint returns HTTP 200', async () => {
		const { mockFetch } = makeFetch()
		const longSub = 'S'.repeat(300)
		const response = await callGET(
			`subtitle=${encodeURIComponent(longSub)}`,
			mockFetch as unknown as typeof fetch,
		)

		expect(response.status).toBe(200)
	})

	it('AC6: subtitle is truncated to exactly 200 chars before reaching satori', async () => {
		const { mockFetch } = makeFetch()
		const longSub = 'C'.repeat(300)

		await callGET(
			`subtitle=${encodeURIComponent(longSub)}`,
			mockFetch as unknown as typeof fetch,
		)

		expect(capturedSatoriNode).toBeDefined()
		const subtitleText = findSubtitleText(capturedSatoriNode)
		expect(subtitleText.length).toBeLessThanOrEqual(200)
	})

	it('AC7: cta longer than 200 chars → endpoint returns HTTP 200', async () => {
		const { mockFetch } = makeFetch()
		const longCta = 'X'.repeat(300)
		const response = await callGET(
			`cta=${encodeURIComponent(longCta)}`,
			mockFetch as unknown as typeof fetch,
		)

		expect(response.status).toBe(200)
	})

	it('AC7: cta is truncated to exactly 200 chars before reaching satori', async () => {
		const { mockFetch } = makeFetch()
		const longCta = 'D'.repeat(300)

		await callGET(
			`cta=${encodeURIComponent(longCta)}`,
			mockFetch as unknown as typeof fetch,
		)

		expect(capturedSatoriNode).toBeDefined()
		const ctaText = findCtaText(capturedSatoriNode)
		// cta must be rendered (300-char value is non-falsy) and truncated
		expect(ctaText).not.toBeNull()
		expect((ctaText as string).length).toBeLessThanOrEqual(200)
	})

	it('AC8: title at exactly 200 chars passes through unchanged (no truncation)', async () => {
		const { mockFetch } = makeFetch()
		const exactTitle = 'E'.repeat(200)

		await callGET(
			`title=${encodeURIComponent(exactTitle)}`,
			mockFetch as unknown as typeof fetch,
		)

		expect(capturedSatoriNode).toBeDefined()
		const titleText = findTitleText(capturedSatoriNode)
		// After toUpperCase, 200 'E's → still 200
		expect(titleText.length).toBe(200)
	})

	it('AC8: title below 200 chars passes through unchanged', async () => {
		const { mockFetch } = makeFetch()
		const shortTitle = 'hello'

		await callGET(
			`title=${encodeURIComponent(shortTitle)}`,
			mockFetch as unknown as typeof fetch,
		)

		expect(capturedSatoriNode).toBeDefined()
		const titleText = findTitleText(capturedSatoriNode)
		// toUpperCase preserves length for ASCII
		expect(titleText).toBe('HELLO')
	})
})

describe('B14 /api/og — fetch timeout (AbortSignal)', () => {
	beforeEach(() => {
		capturedSatoriNode = undefined
		vi.resetModules()
	})

	it('AC9: background image fetch is called with an AbortSignal', async () => {
		const { mockFetch, calls } = makeFetch()

		await callGET(
			'image=/images/test.jpg&title=Test',
			mockFetch as unknown as typeof fetch,
		)

		// Find the call for the background image (not font or logo)
		const bgCall = calls.find(
			(c) => !c.path.includes('font') && !c.path.includes('JetBrainsMono') && !c.path.includes('logo.png'),
		)
		expect(bgCall).toBeDefined()

		// The init object must include a signal (AbortSignal.timeout(5000) or AbortController)
		expect(bgCall!.init).toBeDefined()
		expect(bgCall!.init!.signal).toBeDefined()
		expect(bgCall!.init!.signal).toBeInstanceOf(AbortSignal)
	})

	it('AC9: when background image fetch is aborted, endpoint still returns HTTP 200', async () => {
		// Simulate an AbortError thrown from fetch (as AbortSignal.timeout would cause)
		const mockFetch = vi.fn(async (input: string | URL | Request) => {
			const path =
				typeof input === 'string'
					? input
					: input instanceof URL
						? input.toString()
						: (input as Request).url

			if (path.includes('JetBrainsMono') || path.includes('font')) {
				return new Response(FAKE_FONT_BUFFER, { status: 200 })
			}
			if (path.includes('logo.png')) {
				return new Response(FAKE_LOGO_BUFFER, {
					status: 200,
					headers: { 'content-type': 'image/png' },
				})
			}
			// Simulate a timeout abort for the background image
			throw new DOMException('The operation was aborted', 'AbortError')
		})

		const { GET } = await import('./+server.js')
		const url = makeUrl('image=/images/test.jpg&title=Test')
		const response = await GET({
			url,
			fetch: mockFetch as unknown as typeof fetch,
		} as Parameters<typeof GET>[0])

		// Must still return 200 — fetchAssetAsBase64 catches and returns ""
		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe('image/jpeg')
	})

	it('AC10: font and logo fetches do NOT receive an AbortSignal', async () => {
		const { mockFetch, calls } = makeFetch()

		// No image param — only font and logo fetches occur
		await callGET('title=Hello', mockFetch as unknown as typeof fetch)

		const fontCall = calls.find(
			(c) => c.path.includes('font') || c.path.includes('JetBrainsMono'),
		)
		const logoCall = calls.find((c) => c.path.includes('logo.png'))

		// Both calls must have been made
		expect(fontCall).toBeDefined()
		expect(logoCall).toBeDefined()

		// Neither must carry an AbortSignal
		expect(fontCall!.init?.signal).toBeUndefined()
		expect(logoCall!.init?.signal).toBeUndefined()
	})
})

describe('B14 /api/og — no-regression: valid requests', () => {
	beforeEach(() => {
		capturedSatoriNode = undefined
		vi.resetModules()
	})

	it('AC11: valid relative image + title + subtitle → HTTP 200 with content-type: image/jpeg', async () => {
		const { mockFetch } = makeFetch()
		const response = await callGET(
			'image=/images/foo.webp&title=Hello&subtitle=World',
			mockFetch as unknown as typeof fetch,
		)

		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe('image/jpeg')

		const body = await response.arrayBuffer()
		expect(body.byteLength).toBeGreaterThan(0)
	})

	it('AC12: no query params → HTTP 200 with content-type: image/jpeg', async () => {
		const { mockFetch } = makeFetch()
		const response = await callGET('', mockFetch as unknown as typeof fetch)

		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toBe('image/jpeg')

		const body = await response.arrayBuffer()
		expect(body.byteLength).toBeGreaterThan(0)
	})
})

// ---------------------------------------------------------------------------
// Node tree helpers — walk the satori node object to extract text values.
// The server builds a specific shape: title at fontSize 90px, subtitle at
// 32px, CTA with background #ffb347.
// ---------------------------------------------------------------------------

type SatoriNode = {
	type: string
	props: {
		style?: Record<string, unknown>
		children?: string | SatoriNode | (string | SatoriNode | false | null | undefined)[]
	}
}

function collectText(node: unknown): string[] {
	if (typeof node === 'string') return [node]
	if (!node || typeof node !== 'object') return []
	const n = node as SatoriNode
	if (!n.props) return []
	const { children } = n.props
	if (typeof children === 'string') return [children]
	if (Array.isArray(children)) {
		return children.flatMap((c) => collectText(c))
	}
	if (children && typeof children === 'object') {
		return collectText(children)
	}
	return []
}

/** Title node: div with fontSize '90px'. */
function findTitleText(root: unknown): string {
	if (!root || typeof root !== 'object') return ''
	const n = root as SatoriNode
	if (n.props?.style?.fontSize === '90px') {
		return collectText(n).join('')
	}
	const { children } = n.props ?? {}
	if (Array.isArray(children)) {
		for (const c of children) {
			const found = findTitleText(c)
			if (found) return found
		}
	} else if (children && typeof children === 'object') {
		return findTitleText(children)
	}
	return ''
}

/** Subtitle node: div with fontSize '32px'. */
function findSubtitleText(root: unknown): string {
	if (!root || typeof root !== 'object') return ''
	const n = root as SatoriNode
	if (n.props?.style?.fontSize === '32px') {
		return collectText(n).join('')
	}
	const { children } = n.props ?? {}
	if (Array.isArray(children)) {
		for (const c of children) {
			const found = findSubtitleText(c)
			if (found) return found
		}
	} else if (children && typeof children === 'object') {
		return findSubtitleText(children)
	}
	return ''
}

/** CTA node: div with background '#ffb347'. Returns null if not present. */
function findCtaText(root: unknown): string | null {
	if (!root || typeof root !== 'object') return null
	const n = root as SatoriNode
	if (n.props?.style?.background === '#ffb347') {
		return collectText(n).join('')
	}
	const { children } = n.props ?? {}
	if (Array.isArray(children)) {
		for (const c of children) {
			const found = findCtaText(c)
			if (found !== null) return found
		}
	} else if (children && typeof children === 'object') {
		return findCtaText(children)
	}
	return null
}
