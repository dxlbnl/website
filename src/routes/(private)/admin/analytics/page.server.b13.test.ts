/**
 * B13: Analytics dashboard redesign — load function tests
 *
 * Tests for the new +page.server.ts load function shape.
 * Covers acceptance criteria from wiki/specs/B13-analytics-dashboard-redesign.md.
 *
 * Do NOT modify page.server.test.ts — this file coexists with it.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---- types for the new load result shape (criteria A.1–A.6) ----
type TrendDay = { day: string; visits: number }
type Trend = { days: TrendDay[]; totalVisits: number; uniqueVisitors: number }

type PathChild = { path: string; visits: number; lastSeen: string }
type PathGroup = { segment: string; totalVisits: number; paths: PathChild[] }

type Referrer = { referrer: string; count: number; pct: number }

type Open = {
	slug: string
	broadcastId: string
	sentAt: string
	recipientCount: number
	uniqueOpens: number
	totalOpens: number
}

type Probe = { path: string; hits: number; lastSeen: string }

type B13LoadResult = {
	trend: Trend
	paths: PathGroup[]
	referrers: Referrer[]
	opens: Open[]
	probes: Probe[]
}

// ---- mock $lib/server/db ----
vi.mock('$lib/server/db', () => ({ db: { select: vi.fn() } }))

import { db } from '$lib/server/db'

/**
 * Build a mock db where each db.select() call returns the next item in `results`.
 * The chain supports .from().where().groupBy().orderBy().limit() in any combination.
 * A thenable is installed so `await db.select()...` resolves to the canned value.
 */
function makeDb(results: unknown[]) {
	let callIndex = 0
	const makeChain = (result: unknown): Record<string, unknown> => {
		const chain: Record<string, unknown> = {}
		for (const m of ['select', 'from', 'where', 'groupBy', 'orderBy', 'limit', 'having']) {
			chain[m] = () => chain
		}
		Object.defineProperty(chain, 'then', {
			get() {
				return (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
			},
		})
		return chain
	}
	;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => makeChain(results[callIndex++]))
}

// ---- helpers ----

/** Build a Date n days before today (UTC midnight). */
function daysAgo(n: number): Date {
	const d = new Date()
	d.setUTCHours(0, 0, 0, 0)
	d.setUTCDate(d.getUTCDate() - n)
	return d
}

/** ISO date string YYYY-MM-DD for a Date. */
function toDateStr(d: Date): string {
	return d.toISOString().slice(0, 10)
}

// ---- shared: a helper that returns enough mocked results for the full call sequence ----
// The load function makes N db.select() calls. Exact count is up to the implementer.
// We provide generous padding (10 empty arrays) so that extra calls never throw.
function paddedResults(specific: unknown[]): unknown[] {
	return [...specific, ...Array(10).fill([])]
}

describe('B13 analytics load function — trend', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('gap-fills missing days so trend.days always has exactly 30 entries', async () => {
		// DB returns only 2 days of trend data
		const day0 = daysAgo(29) // oldest day in 30-day window
		const day1 = daysAgo(5) // a recent day

		// Provide results for: trend-days, unique-visitors (possibly a 2nd query),
		// paths, referrers, broadcasts, opens-agg, probes — plus padding.
		makeDb(
			paddedResults([
				// trend daily rows
				[
					{ day: day0, visits: 12 },
					{ day: day1, visits: 7 },
				],
				// unique visitors query (may be a separate select, or combined)
				[{ uniqueVisitors: 5 }],
				// paths
				[],
				// referrers
				[],
				// broadcasts
				[],
				// opens-agg
				[],
				// probes
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		// Criterion A.2: exactly 30 entries
		expect(result.trend.days).toHaveLength(30)

		// The two days with data must have correct visits
		const d0str = toDateStr(day0)
		const d1str = toDateStr(day1)
		const entry0 = result.trend.days.find((e) => e.day === d0str)
		const entry1 = result.trend.days.find((e) => e.day === d1str)
		expect(entry0).toBeDefined()
		expect(entry0!.visits).toBe(12)
		expect(entry1).toBeDefined()
		expect(entry1!.visits).toBe(7)

		// All other entries must have visits: 0
		const others = result.trend.days.filter((e) => e.day !== d0str && e.day !== d1str)
		expect(others).toHaveLength(28)
		for (const e of others) {
			expect(e.visits).toBe(0)
		}
	})

	it('trend.days is ordered oldest-first (ascending by day)', async () => {
		const day0 = daysAgo(29)
		const day5 = daysAgo(5)

		makeDb(
			paddedResults([
				[
					{ day: day5, visits: 3 },
					{ day: day0, visits: 8 },
				],
				[{ uniqueVisitors: 2 }],
				[],
				[],
				[],
				[],
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		const days = result.trend.days.map((e) => e.day)
		const sorted = [...days].sort()
		expect(days).toEqual(sorted)
		expect(days[0]).toBe(toDateStr(day0))
	})

	it('trend.totalVisits is the sum of all visits in the 30-day window', async () => {
		makeDb(
			paddedResults([
				[
					{ day: daysAgo(10), visits: 8 },
					{ day: daysAgo(3), visits: 5 },
				],
				[{ uniqueVisitors: 4 }],
				[],
				[],
				[],
				[],
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.trend.totalVisits).toBe(13)
	})

	it('trend.uniqueVisitors reflects COUNT(DISTINCT visitorHash) from the DB', async () => {
		// The implementation must expose the unique visitor count returned by the DB.
		// We mock the result that the DB unique-visitor query would return.
		makeDb(
			paddedResults([
				// trend days
				[
					{ day: daysAgo(2), visits: 5 },
				],
				// unique visitors
				[{ uniqueVisitors: 3 }],
				// paths, referrers, broadcasts, opens-agg, probes
				[],
				[],
				[],
				[],
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		// Criterion A.2: uniqueVisitors is COUNT(DISTINCT visitorHash)
		// The spec says: given 3 distinct visitorHash values (one null across 5 rows),
		// uniqueVisitors is 3. Our mock returns 3 from the DB; the load fn must pass it through.
		expect(result.trend.uniqueVisitors).toBe(3)
	})
})

describe('B13 analytics load function — paths grouping', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('groups paths by first segment', async () => {
		makeDb(
			paddedResults([
				// trend days
				[],
				// unique visitors
				[{ uniqueVisitors: 0 }],
				// paths: /notes/001-foo, /notes/002-bar, /catalogue/widget
				[
					{ path: '/notes/001-foo', visits: 10, lastSeen: new Date('2026-05-01T12:00:00Z') },
					{ path: '/notes/002-bar', visits: 7, lastSeen: new Date('2026-05-10T08:00:00Z') },
					{ path: '/catalogue/widget', visits: 3, lastSeen: new Date('2026-04-20T10:00:00Z') },
				],
				// referrers
				[],
				// broadcasts
				[],
				// opens-agg
				[],
				// probes
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		// Criterion A.3: grouped by first segment
		const notesGroup = result.paths.find((g) => g.segment === '/notes')
		expect(notesGroup).toBeDefined()
		expect(notesGroup!.paths).toHaveLength(2)
		expect(notesGroup!.totalVisits).toBe(17)

		const catGroup = result.paths.find((g) => g.segment === '/catalogue')
		expect(catGroup).toBeDefined()
		expect(catGroup!.paths).toHaveLength(1)
		expect(catGroup!.totalVisits).toBe(3)
	})

	it('root path / is placed in its own segment group', async () => {
		makeDb(
			paddedResults([
				// trend days
				[],
				// unique visitors
				[{ uniqueVisitors: 0 }],
				// paths: exactly /
				[{ path: '/', visits: 22, lastSeen: new Date('2026-05-15T09:00:00Z') }],
				// referrers
				[],
				// broadcasts
				[],
				// opens-agg
				[],
				// probes
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		// Criterion A.3: / maps to segment '/'
		const rootGroup = result.paths.find((g) => g.segment === '/')
		expect(rootGroup).toBeDefined()
		expect(rootGroup!.paths).toHaveLength(1)
		expect(rootGroup!.paths[0].path).toBe('/')
	})

	it('path groups are ordered by totalVisits descending', async () => {
		makeDb(
			paddedResults([
				[],
				[{ uniqueVisitors: 0 }],
				[
					{ path: '/catalogue/a', visits: 3, lastSeen: new Date() },
					{ path: '/notes/001', visits: 20, lastSeen: new Date() },
					{ path: '/notes/002', visits: 15, lastSeen: new Date() },
				],
				[],
				[],
				[],
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		// /notes has totalVisits=35, /catalogue has 3 → /notes comes first
		expect(result.paths[0].segment).toBe('/notes')
		expect(result.paths[0].totalVisits).toBe(35)
		expect(result.paths[1].segment).toBe('/catalogue')
	})

	it('lastSeen is an ISO string on each child path', async () => {
		const ts = new Date('2026-05-10T08:00:00.000Z')

		makeDb(
			paddedResults([
				[],
				[{ uniqueVisitors: 0 }],
				[{ path: '/notes/001', visits: 5, lastSeen: ts }],
				[],
				[],
				[],
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		const notesGroup = result.paths.find((g) => g.segment === '/notes')
		expect(notesGroup).toBeDefined()
		const child = notesGroup!.paths[0]
		// lastSeen must be an ISO string (parseable as a date)
		expect(typeof child.lastSeen).toBe('string')
		expect(new Date(child.lastSeen).toISOString()).toBe(ts.toISOString())
	})
})

describe('B13 analytics load function — referrers', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('pct is count / total across returned rows (not all pageviews)', async () => {
		// Criterion A.4 + E.27: referrers with counts 80 and 20 → pct 0.8 and 0.2
		makeDb(
			paddedResults([
				[],
				[{ uniqueVisitors: 0 }],
				[],
				// referrers: 80 and 20 visits
				[
					{ referrer: 'https://reddit.com', count: 80 },
					{ referrer: 'https://hn.algolia.com', count: 20 },
				],
				[],
				[],
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.referrers).toHaveLength(2)
		const reddit = result.referrers.find((r) => r.referrer === 'https://reddit.com')!
		const hn = result.referrers.find((r) => r.referrer === 'https://hn.algolia.com')!
		expect(reddit).toBeDefined()
		expect(hn).toBeDefined()

		// pct in [0,1] range
		expect(reddit.pct).toBeCloseTo(0.8, 5)
		expect(hn.pct).toBeCloseTo(0.2, 5)
	})

	it('referrers pct values sum to 1 when multiple referrers present', async () => {
		makeDb(
			paddedResults([
				[],
				[{ uniqueVisitors: 0 }],
				[],
				[
					{ referrer: 'https://a.example', count: 50 },
					{ referrer: 'https://b.example', count: 30 },
					{ referrer: 'https://c.example', count: 20 },
				],
				[],
				[],
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		const sum = result.referrers.reduce((acc, r) => acc + r.pct, 0)
		expect(sum).toBeCloseTo(1, 5)
	})

	it('referrers returns empty array when DB returns no rows', async () => {
		makeDb(paddedResults([[], [{ uniqueVisitors: 0 }], [], [], [], [], []]))

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.referrers).toEqual([])
	})
})

describe('B13 analytics load function — opens (unchanged from B1)', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('opens: merges broadcasts + opens aggregation, zeros for missing', async () => {
		const now = new Date()
		const earlier = new Date(now.getTime() - 3600_000)

		makeDb(
			paddedResults([
				// trend days
				[],
				// unique visitors
				[{ uniqueVisitors: 0 }],
				// paths
				[],
				// referrers
				[],
				// broadcasts
				[
					{ slug: 'B', broadcastId: 'bid-B', sentAt: earlier, recipientCount: 100 },
					{ slug: 'A', broadcastId: 'bid-A', sentAt: now, recipientCount: 100 },
				],
				// opens-agg
				[{ broadcastId: 'bid-A', totalOpens: 10, uniqueOpens: 7 }],
				// probes
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.opens).toHaveLength(2)
		const a = result.opens.find((o) => o.slug === 'A')!
		expect(a.uniqueOpens).toBe(7)
		expect(a.totalOpens).toBe(10)
		const b = result.opens.find((o) => o.slug === 'B')!
		expect(b.uniqueOpens).toBe(0)
		expect(b.totalOpens).toBe(0)
		// sorted desc by sentAt
		expect(result.opens[0].slug).toBe('A')
	})

	it('opens: broadcast with no matching opens row has uniqueOpens:0 totalOpens:0', async () => {
		makeDb(
			paddedResults([
				[],
				[{ uniqueVisitors: 0 }],
				[],
				[],
				[{ slug: 'X', broadcastId: 'bid-X', sentAt: new Date(), recipientCount: 50 }],
				[], // no opens
				[],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.opens).toHaveLength(1)
		expect(result.opens[0].uniqueOpens).toBe(0)
		expect(result.opens[0].totalOpens).toBe(0)
	})
})

describe('B13 analytics load function — probes', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('probes: returns path and hits from DB rows', async () => {
		const ts = new Date('2026-05-19T14:00:00.000Z')

		makeDb(
			paddedResults([
				[],
				[{ uniqueVisitors: 0 }],
				[],
				[],
				[],
				[],
				// probes
				[
					{ path: '/wp-admin/setup', hits: 42, lastSeen: ts },
					{ path: '/.env', hits: 13, lastSeen: ts },
				],
			]),
		)

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.probes).toHaveLength(2)
		expect(result.probes[0].path).toBe('/wp-admin/setup')
		expect(result.probes[0].hits).toBe(42)
		// lastSeen must be an ISO string
		expect(typeof result.probes[0].lastSeen).toBe('string')
		expect(new Date(result.probes[0].lastSeen).toISOString()).toBe(ts.toISOString())
	})

	it('probes: returns empty array when no bot rows exist', async () => {
		makeDb(paddedResults([[], [{ uniqueVisitors: 0 }], [], [], [], [], []]))

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.probes).toEqual([])
	})
})

describe('B13 analytics load function — return shape (all 5 keys)', () => {
	beforeEach(() => {
		vi.resetModules()
	})

	it('load result has exactly the five top-level keys: trend, paths, referrers, opens, probes', async () => {
		makeDb(paddedResults([[], [{ uniqueVisitors: 0 }], [], [], [], [], []]))

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as Record<string, unknown>

		expect(result).toHaveProperty('trend')
		expect(result).toHaveProperty('paths')
		expect(result).toHaveProperty('referrers')
		expect(result).toHaveProperty('opens')
		expect(result).toHaveProperty('probes')
	})

	it('trend has days, totalVisits, uniqueVisitors keys', async () => {
		makeDb(paddedResults([[], [{ uniqueVisitors: 0 }], [], [], [], [], []]))

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as B13LoadResult

		expect(result.trend).toHaveProperty('days')
		expect(result.trend).toHaveProperty('totalVisits')
		expect(result.trend).toHaveProperty('uniqueVisitors')
		expect(Array.isArray(result.trend.days)).toBe(true)
	})

	it('the old "pageviews" key is gone — replaced by "paths"', async () => {
		makeDb(paddedResults([[], [{ uniqueVisitors: 0 }], [], [], [], [], []]))

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as Record<string, unknown>

		// The B1 load returned { opens, pageviews }. B13 replaces pageviews with paths/trend/referrers/probes.
		expect(result).not.toHaveProperty('pageviews')
	})
})
