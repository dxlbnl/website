import { db } from '$lib/server/db'
import { emailOpens, mailingBroadcasts, pageviews } from '$lib/server/db/schema'
import { and, count, countDistinct, desc, not, like } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const prerender = false

export const load: PageServerLoad = async () => {
	const broadcasts = await db.select().from(mailingBroadcasts)

	const openAggs = await db
		.select({
			broadcastId: emailOpens.broadcastId,
			totalOpens: count(),
			uniqueOpens: countDistinct(emailOpens.recipientEmail),
		})
		.from(emailOpens)
		.groupBy(emailOpens.broadcastId)

	const aggMap: Record<string, { totalOpens: number; uniqueOpens: number }> = {}
	for (const row of openAggs) {
		if (!row.broadcastId) continue
		aggMap[row.broadcastId] = { totalOpens: row.totalOpens, uniqueOpens: row.uniqueOpens }
	}

	const opens = broadcasts
		.map((b) => {
			const agg = aggMap[b.broadcastId] ?? { totalOpens: 0, uniqueOpens: 0 }
			return {
				slug: b.slug,
				broadcastId: b.broadcastId,
				sentAt: b.sentAt.toISOString(),
				recipientCount: b.recipientCount,
				uniqueOpens: agg.uniqueOpens,
				totalOpens: agg.totalOpens,
			}
		})
		.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

	const pvRows = await db
		.select({ path: pageviews.path, visits: count() })
		.from(pageviews)
		.where(and(not(like(pageviews.path, '/admin%')), not(like(pageviews.path, '/api%'))))
		.groupBy(pageviews.path)
		.orderBy(desc(count()))
		.limit(50)

	return { opens, pageviews: pvRows }
}
