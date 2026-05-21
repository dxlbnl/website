import { describe, it, expect, vi } from 'vitest'

vi.mock('$lib/server/db', () => {
	const makeChain = (result: unknown) => {
		const chain: Record<string, unknown> = {}
		const methods = ['select', 'from', 'groupBy', 'orderBy', 'limit']
		for (const m of methods) {
			chain[m] = () => chain
		}
		chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
		return chain
	}

	const db = {
		_results: [] as unknown[],
		_callIndex: 0,
		select: vi.fn(),
	}

	return { db }
})

import { db } from '$lib/server/db'

function makeDb(results: unknown[]) {
	let callIndex = 0
	const makeChain = (result: unknown): Record<string, unknown> => {
		const chain: Record<string, unknown> = {}
		for (const m of ['select', 'from', 'groupBy', 'orderBy', 'limit']) {
			chain[m] = () => chain
		}
		// Make the chain thenable so Drizzle's awaiting works
		chain[Symbol.iterator as unknown as string] = undefined
		Object.defineProperty(chain, 'then', {
			get() {
				return (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve)
			},
		})
		return chain
	}

	;(db.select as ReturnType<typeof vi.fn>).mockImplementation(() => makeChain(results[callIndex++]))
}

describe('analytics load function', () => {
	it('merges broadcast + opens aggregation correctly', async () => {
		const now = new Date()
		const earlier = new Date(now.getTime() - 1000 * 60 * 60)

		makeDb([
			// mailingBroadcasts rows (sorted desc by sentAt after merge)
			[
				{ slug: 'B', broadcastId: 'bid-B', sentAt: earlier, recipientCount: 100 },
				{ slug: 'A', broadcastId: 'bid-A', sentAt: now, recipientCount: 100 },
			],
			// emailOpens aggregation — only A has opens
			[{ broadcastId: 'bid-A', totalOpens: 10, uniqueOpens: 7 }],
			// pageviews (not used by this test but load always runs 3 queries)
			[],
		])

		const { load } = await import('./+page.server.js')
		const result = await load({} as Parameters<typeof load>[0])

		expect(result.opens).toHaveLength(2)

		const a = result.opens.find((o) => o.slug === 'A')!
		expect(a.uniqueOpens).toBe(7)
		expect(a.totalOpens).toBe(10)

		const b = result.opens.find((o) => o.slug === 'B')!
		expect(b.uniqueOpens).toBe(0)
		expect(b.totalOpens).toBe(0)

		// sorted descending by sentAt
		expect(result.opens[0].slug).toBe('A')
		expect(result.opens[1].slug).toBe('B')
	})

	it('null recipientEmail pass-through: numbers come back verbatim', async () => {
		const now = new Date()
		makeDb([
			[{ slug: 'X', broadcastId: 'bid-X', sentAt: now, recipientCount: 50 }],
			[{ broadcastId: 'bid-X', totalOpens: 5, uniqueOpens: 3 }],
			[],
		])

		const { load } = await import('./+page.server.js')
		const result = await load({} as Parameters<typeof load>[0])
		expect(result.opens[0].uniqueOpens).toBe(3)
		expect(result.opens[0].totalOpens).toBe(5)
	})

	it('pageviews: returns up to 100 rows in order', async () => {
		const rows = Array.from({ length: 100 }, (_, i) => ({
			id: 100 - i,
			path: `/p/${i}`,
			referrer: null,
			visitedAt: new Date(Date.now() - i * 1000),
		}))

		makeDb([[], [], rows])

		const { load } = await import('./+page.server.js')
		const result = await load({} as Parameters<typeof load>[0])

		expect(result.pageviews).toHaveLength(100)
		expect(result.pageviews[0].id).toBe(100)
	})

	it('null referrer round-trips as null in payload', async () => {
		makeDb([
			[],
			[],
			[{ id: 1, path: '/foo', referrer: null, visitedAt: new Date() }],
		])

		const { load } = await import('./+page.server.js')
		const result = await load({} as Parameters<typeof load>[0])
		expect(result.pageviews[0].referrer).toBeNull()
	})
})
