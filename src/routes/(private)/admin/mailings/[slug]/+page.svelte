<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import Led from '$lib/ui/Led.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import { fmtDate } from '$lib/utils/fmt';
	import type { PageData, ActionData } from './$types';

	type Props = { data: PageData; form: ActionData };
	let { data, form }: Props = $props();

	let sending = $state(false);

	const previewHtml = $derived(data.emailHtml.replace('<head>', '<head><base target="_blank">'));
</script>

<PageHero eyebrow="// ADMIN · MAILINGS · {data.mailing.slug}" title={data.mailing.title}>
	<div class="meta-row">
		<span class="meta-item">{fmtDate(data.mailing.date)}</span>
		<span class="meta-sep">·</span>
		<span class="meta-item mono">{data.mailing.subject}</span>
		<span class="meta-sep">·</span>
		<span class="published" class:live={!!data.broadcast}>{data.broadcast ? 'SENT' : 'DRAFT'}</span>
	</div>
</PageHero>

<section class="actions">
	<div class="section-label">// ACTIONS</div>
	<div class="action-row">
		{#if data.broadcast}
			<div class="stats">
				<span class="stat">{data.broadcast.recipientCount} SENT</span>
				<span class="stat amber">{data.opens} / {data.broadcast.recipientCount} OPENED</span>
				<span class="stat dim">SENT {fmtDate(data.broadcast.sentAt)}</span>
			</div>
		{/if}

		<form
			method="POST"
			action="?/send"
			use:enhance={() => {
				sending = true;
				return async ({ update }) => {
					await update();
					sending = false;
				};
			}}
		>
			<button type="submit" class="send-btn" disabled={sending || !!data.broadcast}>
				{sending ? 'SENDING...' : data.broadcast ? 'SENT ✓' : 'SEND TO LIST →'}
			</button>
		</form>

		{#if form?.error}
			<span class="feedback err"><Led tone="danger" />{form.error}</span>
		{/if}
		{#if form?.broadcastId}
			<span class="feedback ok"
				><Led tone="ok" />Sent — <code>{form.broadcastId.slice(0, 8)}…</code></span
			>
		{/if}
	</div>
</section>

<section class="preview-section">
	<div class="section-label">// EMAIL PREVIEW</div>
	<div class="preview-wrap">
		<iframe
			class="preview"
			srcdoc={previewHtml}
			title="Email preview"
			sandbox="allow-same-origin allow-popups"
		></iframe>
	</div>
</section>

<div class="back-row">
	<a href={resolve('/admin/mailings/')} class="btn-back">← BACK TO MAILINGS</a>
	{#if data.mailing.published}
		<a href={resolve(`/mailings/${data.mailing.slug}/`)} target="_blank" class="btn-back"
			>VIEW PUBLIC →</a
		>
	{/if}
</div>

<style>
	.meta-row {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		flex-wrap: wrap;
	}
	.meta-item {
		color: var(--ink-dim);
		letter-spacing: 0.04em;
	}
	.meta-sep {
		color: var(--ink-faint);
	}
	.published {
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.published.live {
		color: var(--ok);
	}
	.section-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
		padding: 24px 0 12px;
	}
	.actions {
		border-bottom: 1px solid var(--rule);
		padding-bottom: 24px;
	}
	.action-row {
		display: flex;
		align-items: center;
		gap: 20px;
		flex-wrap: wrap;
	}
	.stats {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}
	.stat {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-dim);
	}
	.stat.amber {
		color: var(--amber);
	}
	.stat.dim {
		color: var(--ink-faint);
	}
	.send-btn {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		padding: 10px 18px;
		border: 1px solid var(--rule);
		color: var(--ink-dim);
		background: none;
		text-transform: uppercase;
		cursor: pointer;
		white-space: nowrap;
		transition:
			border-color 0.15s,
			color 0.15s;
	}
	.send-btn:hover:not(:disabled) {
		border-color: var(--amber);
		color: var(--amber);
	}
	.send-btn:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.feedback {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
	}
	.feedback.err {
		color: var(--danger);
	}
	.feedback.ok {
		color: var(--ok);
	}
	code {
		font-family: var(--mono);
		font-size: var(--t-mono);
		background: var(--bg-elev);
		padding: 2px 6px;
		border: 1px solid var(--rule);
	}
	.preview-section {
		padding-bottom: 40px;
		border-bottom: 1px solid var(--rule);
	}
	.preview-wrap {
		border: 1px solid var(--rule);
		background: #f5f5f0;
		padding: 24px;
		border-radius: 2px;
	}
	.preview {
		display: block;
		width: 100%;
		min-height: 600px;
		border: none;
		background: transparent;
	}
	.back-row {
		display: flex;
		gap: 24px;
		padding: 24px 0;
	}
</style>
