import { describe, it, expect, vi } from 'vitest'

type LoadResult = { opens: Record<string, unknown>[]; pageviews: Record<string, unknown>[] }

vi.mock('$lib/server/db', () => ({ db: { select: vi.fn() } }))

import { db } from '$lib/server/db'

function makeDb(results: unknown[]) {
	let callIndex = 0
	const makeChain = (result: unknown): Record<string, unknown> => {
		const chain: Record<string, unknown> = {}
		for (const m of ['select', 'from', 'where', 'groupBy', 'orderBy', 'limit']) {
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

describe('analytics load function', () => {
	it('merges broadcasts + opens aggregation, zeros for missing', async () => {
		const now = new Date()
		const earlier = new Date(now.getTime() - 3600_000)

		makeDb([
			[
				{ slug: 'B', broadcastId: 'bid-B', sentAt: earlier, recipientCount: 100 },
				{ slug: 'A', broadcastId: 'bid-A', sentAt: now, recipientCount: 100 },
			],
			[{ broadcastId: 'bid-A', totalOpens: 10, uniqueOpens: 7 }],
			[],
		])

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as LoadResult

		expect(result.opens).toHaveLength(2)
		const a = result.opens.find((o) => o.slug === 'A')!
		expect(a.uniqueOpens).toBe(7)
		expect(a.totalOpens).toBe(10)
		const b = result.opens.find((o) => o.slug === 'B')!
		expect(b.uniqueOpens).toBe(0)
		expect(b.totalOpens).toBe(0)
		expect(result.opens[0].slug).toBe('A') // sorted desc by sentAt
	})

	it('null recipientEmail: numbers pass through verbatim', async () => {
		makeDb([
			[{ slug: 'X', broadcastId: 'bid-X', sentAt: new Date(), recipientCount: 50 }],
			[{ broadcastId: 'bid-X', totalOpens: 5, uniqueOpens: 3 }],
			[],
		])

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as LoadResult
		expect(result.opens[0].uniqueOpens).toBe(3)
		expect(result.opens[0].totalOpens).toBe(5)
	})

	it('pageviews: returns path + visit count aggregated', async () => {
		makeDb([
			[],
			[],
			[
				{ path: '/notes/001-intro', visits: 42 },
				{ path: '/catalogue', visits: 17 },
			],
		])

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as LoadResult

		expect(result.pageviews).toHaveLength(2)
		expect(result.pageviews[0]).toEqual({ path: '/notes/001-intro', visits: 42 })
	})

	it('pageviews: empty when no rows', async () => {
		makeDb([[], [], []])

		const { load } = await import('./+page.server.js')
		const result = (await load({} as Parameters<typeof load>[0])) as LoadResult
		expect(result.pageviews).toHaveLength(0)
	})
})
