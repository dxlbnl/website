<script lang="ts">
	import { fmtDate } from '$lib/utils/fmt';
	import { resolve } from '$app/paths';

	type Props = {
		slug: string;
		idx: number;
		title: string;
		date: string;
		kind?: string;
		lede?: string;
	};
	let { slug, idx, title, date, kind, lede }: Props = $props();

	function hexIdx(n: number) {
		return '0x' + n.toString(16).padStart(2, '0').toUpperCase();
	}
</script>

<a href={resolve(`/notes/${slug}/`)} class="note-card">
	<div class="card-head">
		<span class="card-idx">{hexIdx(idx)}</span>
		<span class="card-kind">{kind ?? 'LOG'}</span>
	</div>
	<h3 class="card-title">{title}</h3>
	{#if lede}<p class="card-desc">{lede}</p>{/if}
	<div class="card-foot">
		<span>{fmtDate(date)}</span>
		<span class="card-read">READ &rarr;</span>
	</div>
</a>

<style>
	.note-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		border: 1px solid var(--rule);
		background: var(--bg-rail);
		color: inherit;
		transition: border-color 0.15s;
	}
	.note-card:hover {
		border-color: var(--amber);
	}
	.card-head {
		display: flex;
		justify-content: space-between;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.card-idx {
		color: var(--ink-faint);
	}
	.card-kind {
		color: var(--cyan);
	}
	.card-title {
		font-weight: 500;
		font-size: var(--t-lede);
		letter-spacing: -0.01em;
		margin: 4px 0 0;
	}
	.card-desc {
		font-size: var(--t-body);
		color: var(--ink-dim);
		line-height: 1.5;
		flex: 1;
	}
	.card-foot {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		color: var(--ink-faint);
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px dashed var(--rule);
	}
	.card-read {
		color: var(--amber);
	}
</style>
