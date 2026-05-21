import { describe, it, expect } from 'vitest'
import {
	parseDeviceType,
	parseOs,
	parseBrowser,
	computeVisitorHash,
} from '$lib/server/analytics'

// ---------------------------------------------------------------------------
// AC6 — parseDeviceType
// ---------------------------------------------------------------------------
describe('parseDeviceType', () => {
	it('returns null when UA is null', () => {
		expect(parseDeviceType(null)).toBeNull()
	})

	it('returns "tablet" for iPad UA', () => {
		const ipadUA =
			'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
		expect(parseDeviceType(ipadUA)).toBe('tablet')
	})

	it('returns "mobile" for iPhone UA', () => {
		const iphoneUA =
			'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
		expect(parseDeviceType(iphoneUA)).toBe('mobile')
	})

	it('returns "mobile" for generic Android mobile UA', () => {
		const androidUA =
			'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
		expect(parseDeviceType(androidUA)).toBe('mobile')
	})

	it('returns "desktop" for generic desktop UA', () => {
		const desktopUA =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		expect(parseDeviceType(desktopUA)).toBe('desktop')
	})

	it('tablet rule takes precedence over mobile (tablet keyword first in rules)', () => {
		// A UA that contains both "tablet" and "mobile" should be "tablet"
		const tabletUA = 'Mozilla/5.0 (Linux; Android 10; SM-T510) tablet mobile'
		expect(parseDeviceType(tabletUA)).toBe('tablet')
	})
})

// ---------------------------------------------------------------------------
// AC6 — parseOs
// ---------------------------------------------------------------------------
describe('parseOs', () => {
	it('returns null when UA is null', () => {
		expect(parseOs(null)).toBeNull()
	})

	it('returns "iOS" for iPhone UA', () => {
		const iphoneUA =
			'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
		expect(parseOs(iphoneUA)).toBe('iOS')
	})

	it('returns "iOS" for iPad UA', () => {
		const ipadUA =
			'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
		expect(parseOs(ipadUA)).toBe('iOS')
	})

	it('returns "Android" for Android UA', () => {
		const androidUA =
			'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
		expect(parseOs(androidUA)).toBe('Android')
	})

	it('returns "Windows" for Windows UA', () => {
		const winUA =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		expect(parseOs(winUA)).toBe('Windows')
	})

	it('returns "macOS" for macOS UA', () => {
		const macUA =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		expect(parseOs(macUA)).toBe('macOS')
	})

	it('returns "Linux" for Linux desktop UA', () => {
		const linuxUA =
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		expect(parseOs(linuxUA)).toBe('Linux')
	})

	it('returns "Other" for an unrecognised UA', () => {
		expect(parseOs('SomeObscureCrawler/1.0')).toBe('Other')
	})

	it('iOS rule takes precedence over Linux (iPod contains no Linux but iPhone does not clash)', () => {
		// iPod is also iOS
		const ipodUA =
			'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'
		expect(parseOs(ipodUA)).toBe('iOS')
	})
})

// ---------------------------------------------------------------------------
// AC7 — parseBrowser
// ---------------------------------------------------------------------------
describe('parseBrowser', () => {
	it('returns null when UA is null', () => {
		expect(parseBrowser(null)).toBeNull()
	})

	it('returns "Edge" for modern Edge UA (contains Edg/)', () => {
		const edgeUA =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.58'
		expect(parseBrowser(edgeUA)).toBe('Edge')
	})

	it('returns "Firefox" for Firefox UA', () => {
		const firefoxUA =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0'
		expect(parseBrowser(firefoxUA)).toBe('Firefox')
	})

	it('returns "Chrome" for Chrome UA (also contains Safari)', () => {
		// Chrome UAs include "Safari/" — Edge rule must be checked first, Chrome second
		const chromeUA =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		expect(parseBrowser(chromeUA)).toBe('Chrome')
	})

	it('returns "Safari" for Safari UA (no Chrome token)', () => {
		const safariUA =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15'
		expect(parseBrowser(safariUA)).toBe('Safari')
	})

	it('returns "Other" for an unrecognised UA', () => {
		expect(parseBrowser('Googlebot/2.1 (+http://www.google.com/bot.html)')).toBe('Other')
	})

	// Ordering edge cases — these are load-bearing per spec AC7
	it('Edge UA (contains both Edg/ and Chrome/) is classified as "Edge", not "Chrome"', () => {
		const edgeUA =
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.58'
		// Must not return 'Chrome' even though 'Chrome/' is present
		expect(parseBrowser(edgeUA)).not.toBe('Chrome')
		expect(parseBrowser(edgeUA)).toBe('Edge')
	})

	it('Chrome UA (contains Safari/) is classified as "Chrome", not "Safari"', () => {
		const chromeUA =
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
		expect(parseBrowser(chromeUA)).not.toBe('Safari')
		expect(parseBrowser(chromeUA)).toBe('Chrome')
	})
})

// ---------------------------------------------------------------------------
// AC4 — computeVisitorHash
// ---------------------------------------------------------------------------
describe('computeVisitorHash', () => {
	const ip = '203.0.113.42'
	const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/112.0.0.0'
	const date = '2026-05-21'
	const salt = 'test-salt'

	it('returns a 64-character lowercase hex string', async () => {
		const hash = await computeVisitorHash(ip, ua, date, salt)
		expect(hash).toMatch(/^[0-9a-f]{64}$/)
	})

	it('is deterministic — same inputs produce the same hash', async () => {
		const h1 = await computeVisitorHash(ip, ua, date, salt)
		const h2 = await computeVisitorHash(ip, ua, date, salt)
		expect(h1).toBe(h2)
	})

	it('different IP produces a different hash', async () => {
		const h1 = await computeVisitorHash(ip, ua, date, salt)
		const h2 = await computeVisitorHash('198.51.100.7', ua, date, salt)
		expect(h1).not.toBe(h2)
	})

	it('different date produces a different hash (daily rotation)', async () => {
		const h1 = await computeVisitorHash(ip, ua, '2026-05-21', salt)
		const h2 = await computeVisitorHash(ip, ua, '2026-05-22', salt)
		expect(h1).not.toBe(h2)
	})

	it('different salt produces a different hash', async () => {
		const h1 = await computeVisitorHash(ip, ua, date, 'salt-a')
		const h2 = await computeVisitorHash(ip, ua, date, 'salt-b')
		expect(h1).not.toBe(h2)
	})

	it('different UA produces a different hash', async () => {
		const h1 = await computeVisitorHash(ip, ua, date, salt)
		const h2 = await computeVisitorHash(ip, 'OtherBrowser/1.0', date, salt)
		expect(h1).not.toBe(h2)
	})
})
