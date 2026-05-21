<script lang="ts">
	import { PageHero, Spread, Stack, Inline, Rule, Text, StatCard } from '@dxlbnl/ui'
	import MiniBarChart from '$lib/ui/MiniBarChart.svelte'
	import { fmtDate } from '$lib/utils/fmt'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
</script>

<PageHero eyebrow="// ADMIN · ANALYTICS" heading="Analytics." />

<section>
	<Text variant="eyebrow" color="faint">// TREND — LAST 30 DAYS</Text>
	<Inline gap="lg">
		<StatCard label="VISITS" value={String(data.trend.totalVisits)} sublabel="last 30 days" />
		<StatCard label="VISITORS" value={String(data.trend.uniqueVisitors)} sublabel="unique" />
	</Inline>
	<div class="chart-wrap">
		<MiniBarChart data={data.trend.days} />
	</div>
</section>

<Rule />

<section>
	<Text variant="eyebrow" color="faint">// TOP PATHS</Text>
	<Stack gap="none">
		<div class="col-header"><Spread>
			<Text variant="mono" color="faint">PATH</Text>
			<Inline gap="md">
				<Text variant="mono" color="faint">VISITS</Text>
				<Text variant="mono" color="faint">LAST SEEN</Text>
			</Inline>
		</Spread></div>
		{#each data.paths as group (group.segment)}
			{#if group.paths.length > 1}
				<div class="segment-row"><Spread>
					<Text variant="mono" color="amber">{group.segment}</Text>
					<Text variant="mono" color="faint">{group.totalVisits}</Text>
				</Spread></div>
				{#each group.paths as child (child.path)}
					<div class="path-row indent"><Spread>
						<Text variant="mono">{child.path}</Text>
						<Inline gap="md">
							<Text variant="mono" color="amber">{child.visits}</Text>
							<Text variant="mono" color="faint">{fmtDate(child.lastSeen)}</Text>
						</Inline>
					</Spread></div>
				{/each}
			{:else}
				<div class="path-row"><Spread>
					<Text variant="mono">{group.paths[0].path}</Text>
					<Inline gap="md">
						<Text variant="mono" color="amber">{group.paths[0].visits}</Text>
						<Text variant="mono" color="faint">{fmtDate(group.paths[0].lastSeen)}</Text>
					</Inline>
				</Spread></div>
			{/if}
		{:else}
			<Text variant="mono" color="faint">// NO PAGEVIEWS RECORDED</Text>
		{/each}
	</Stack>
</section>

<Rule />

<section>
	<Text variant="eyebrow" color="faint">// REFERRERS</Text>
	<Stack gap="none">
		<div class="col-header"><Spread>
			<Text variant="mono" color="faint">REFERRER</Text>
			<Text variant="mono" color="faint">VISITS</Text>
		</Spread></div>
		{#each data.referrers as row (row.referrer)}
			<div class="ref-row">
				<Spread>
					<Text variant="mono">{row.referrer}</Text>
					<Text variant="mono" color="amber">{row.count}</Text>
				</Spread>
				<div class="bar-wrap" style="--pct: {row.pct}"><div class="bar"></div></div>
			</div>
		{:else}
			<Text variant="mono" color="faint">// NO REFERRERS RECORDED</Text>
		{/each}
	</Stack>
</section>

<Rule />

<section>
	<Text variant="eyebrow" color="faint">// OPENS PER BROADCAST</Text>
	<Stack gap="none">
		{#each data.opens as row (row.broadcastId)}
			<div class="opens-row"><Spread>
				<Text variant="mono">{row.slug}</Text>
				<Inline gap="md">
					<Text variant="mono" color="faint">{fmtDate(row.sentAt)}</Text>
					<Text variant="mono">{row.uniqueOpens} / {row.recipientCount} OPENED</Text>
					<Text variant="mono" color="faint">{row.totalOpens} TOTAL</Text>
				</Inline>
			</Spread></div>
		{:else}
			<Text variant="mono" color="faint">// NO BROADCASTS SENT YET</Text>
		{/each}
	</Stack>
</section>

<Rule />

<section>
	<Text variant="eyebrow" color="faint">// PROBE TRAFFIC</Text>
	<Stack gap="none">
		<div class="col-header"><Spread>
			<Text variant="mono" color="faint">PATH</Text>
			<Inline gap="md">
				<Text variant="mono" color="faint">HITS</Text>
				<Text variant="mono" color="faint">LAST SEEN</Text>
			</Inline>
		</Spread></div>
		{#each data.probes as row (row.path)}
			<div class="path-row"><Spread>
				<Text variant="mono">{row.path}</Text>
				<Inline gap="md">
					<Text variant="mono" color="amber">{row.hits}</Text>
					<Text variant="mono" color="faint">{fmtDate(row.lastSeen)}</Text>
				</Inline>
			</Spread></div>
		{:else}
			<Text variant="mono" color="faint">// NO PROBE TRAFFIC</Text>
		{/each}
	</Stack>
</section>

<style>
	section {
		padding: var(--u2) 0 var(--u4);
	}

	.chart-wrap {
		margin-top: var(--u2);
	}

	.col-header {
		padding: var(--u) 0;
		border-bottom: 1px solid var(--rule);
		opacity: 0.6;
	}

	.segment-row {
		padding: var(--u2) 0 var(--u) 0;
		border-top: 1px solid var(--rule-strong);
		margin-top: var(--u);
	}

	.path-row {
		padding: var(--u) 0;
		border-bottom: 1px solid var(--rule);
	}

	.indent {
		padding-left: var(--u4);
	}

	.opens-row {
		padding: var(--u2) 0;
		border-bottom: 1px solid var(--rule);
	}

	.ref-row {
		padding: var(--u) 0;
		border-bottom: 1px solid var(--rule);
	}

	.bar-wrap {
		height: 4px;
		background: var(--rule);
		margin-top: 6px;
	}

	.bar {
		height: 100%;
		width: calc(var(--pct) * 100%);
		background: var(--amber);
	}
</style>
