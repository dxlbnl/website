import { db } from '$lib/server/db'
import { emailOpens, mailingBroadcasts, pageviews } from '$lib/server/db/schema'
import { sql, gte, isNotNull, or, and, not, like, eq, count, countDistinct, desc } from 'drizzle-orm'
import type { PageServerLoad } from './$types'

export const prerender = false

const BOT_PATTERNS = [
	'/wp-%',
	'/blog%',
	'/.env%',
	'%.php',
	'/.git%',
	'/phpmyadmin%',
	'/administrator%',
	'/cgi-bin%',
	'/feed%',
	'/xmlrpc%',
	'/wordpress%',
	'/backup%',
	'/.well-known%',
	'/config%',
	'/setup%',
	'/install%',
	'/shell%',
	'/vendor%',
]
const isBot = or(...BOT_PATTERNS.map((p) => like(pageviews.path, p)))!
const isNotBot = not(isBot)

// Derive valid path prefixes from actual SvelteKit route files — stays in sync automatically
const routeKeys = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'))
const derivedPrefixes = new Set<string>()
for (const key of routeKeys) {
	const clean = key
		.slice('/src/routes'.length)
		.replace(/\/\([^)]+\)/g, '')      // strip route groups like (console)
		.replace(/\/\+page\.svelte$/, '') // strip filename
	const firstSeg = clean.split('/').filter(Boolean)[0]
	if (firstSeg && !firstSeg.startsWith('[')) derivedPrefixes.add('/' + firstSeg)
}
const isSitePath = or(
	eq(pageviews.path, '/'),
	...[...derivedPrefixes].map((p) => like(pageviews.path, p + '%')),
)!

export const load: PageServerLoad = async () => {
	// Query 1 — trend (30-day daily counts)
	const trendRows = await db
		.select({ day: sql<Date>`date_trunc('day', ${pageviews.visitedAt})`, visits: count() })
		.from(pageviews)
		.where(
			and(
				isNotBot,
				not(like(pageviews.path, '/admin%')),
				not(like(pageviews.path, '/api%')),
				gte(pageviews.visitedAt, sql`now() - interval '30 days'`),
			),
		)
		.groupBy(sql`date_trunc('day', ${pageviews.visitedAt})`)
		.orderBy(sql`date_trunc('day', ${pageviews.visitedAt})`)

	// Query 2 — unique visitors
	const uvRow = await db
		.select({ uniqueVisitors: countDistinct(pageviews.visitorHash) })
		.from(pageviews)
		.where(
			and(
				isNotBot,
				not(like(pageviews.path, '/admin%')),
				not(like(pageviews.path, '/api%')),
				gte(pageviews.visitedAt, sql`now() - interval '30 days'`),
				isNotNull(pageviews.visitorHash),
			),
		)

	// Gap-fill for trend.days
	const dayMap = new Map(
		trendRows.map((r) => [new Date(r.day).toISOString().slice(0, 10), r.visits]),
	)
	const days = Array.from({ length: 30 }, (_, i) => {
		const d = new Date()
		d.setUTCDate(d.getUTCDate() - 29 + i)
		const key = d.toISOString().slice(0, 10)
		return { day: key, visits: dayMap.get(key) ?? 0 }
	})
	const totalVisits = days.reduce((s, d) => s + d.visits, 0)
	const uniqueVisitors = uvRow[0]?.uniqueVisitors ?? 0

	// Query 3 — paths
	const pathRows = await db
		.select({
			path: pageviews.path,
			visits: count(),
			lastSeen: sql<Date>`MAX(${pageviews.visitedAt})`,
		})
		.from(pageviews)
		.where(
			and(isNotBot, isSitePath),
		)
		.groupBy(pageviews.path)
		.orderBy(desc(count()))
		.limit(50)

	// Group paths by first segment
	const sectionMap = new Map<string, typeof pathRows>()
	for (const row of pathRows) {
		const trimmed = row.path.replace(/\/$/, '') || '/'
		const parts = trimmed.split('/').filter(Boolean)
		const segment = parts.length === 0 ? '/' : '/' + parts[0]
		if (!sectionMap.has(segment)) sectionMap.set(segment, [])
		sectionMap.get(segment)!.push(row)
	}
	const paths = [...sectionMap.entries()]
		.map(([segment, rows]) => ({
			segment,
			totalVisits: rows.reduce((s, r) => s + r.visits, 0),
			paths: rows.map((r) => ({
				path: r.path,
				visits: r.visits,
				lastSeen: new Date(r.lastSeen).toISOString(),
			})),
		}))
		.sort((a, b) => b.totalVisits - a.totalVisits)

	// Query 4 — referrers
	const refRows = await db
		.select({ referrer: pageviews.referrer, count: count() })
		.from(pageviews)
		.where(
			and(
				isNotBot,
				not(like(pageviews.path, '/admin%')),
				not(like(pageviews.path, '/api%')),
				isNotNull(pageviews.referrer),
				not(like(pageviews.referrer, '%dexterlabs.nl%')),
			),
		)
		.groupBy(pageviews.referrer)
		.orderBy(desc(count()))
		.limit(20)
	const totalRefs = refRows.reduce((s, r) => s + r.count, 0)
	const referrers = refRows.map((r) => ({
		referrer: r.referrer!,
		count: r.count,
		pct: totalRefs > 0 ? r.count / totalRefs : 0,
	}))

	// Queries 5 & 6 — opens (same as B1)
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

	// Query 7 — probes
	const probeRows = await db
		.select({
			path: pageviews.path,
			hits: count(),
			lastSeen: sql<Date>`MAX(${pageviews.visitedAt})`,
		})
		.from(pageviews)
		.where(isBot)
		.groupBy(pageviews.path)
		.orderBy(desc(count()))
		.limit(20)
	const probes = probeRows.map((r) => ({
		path: r.path,
		hits: r.hits,
		lastSeen: new Date(r.lastSeen).toISOString(),
	}))

	return {
		trend: { days, totalVisits, uniqueVisitors },
		paths,
		referrers,
		opens,
		probes,
	}
}
