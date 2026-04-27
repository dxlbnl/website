<script lang="ts">
	import { enhance } from '$app/forms';
	import Led from '$lib/ui/Led.svelte';
	import type { PageData, ActionData } from './$types';

	type Props = { data: PageData; form: ActionData };
	let { data, form }: Props = $props();

	function fmt(d: string) {
		return new Date(d).toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: '2-digit'
		});
	}
</script>

{#if !data.authed}
	<section class="hero">
		<div class="eyebrow">// ADMIN · ACCESS CONTROL</div>
		<h1>Authenticate.</h1>
		<p class="sub">Go to <a href="/admin">/admin</a> to log in first.</p>
	</section>
{:else}
	<section class="hero">
		<div class="eyebrow">// ADMIN · MAILINGS</div>
		<h1>Mailings.</h1>
		<p class="sub">
			Send a mailing as a Resend Broadcast to your entire audience. Sent immediately — no undo.
		</p>
		<div class="meta">
			<span><b>{data.mailings.length}</b> DRAFTS</span>
		</div>
	</section>

	{#if form?.error}
		<p class="err"><Led tone="danger" />{form.error}</p>
	{/if}
	{#if form?.broadcastId}
		<p class="ok"><Led tone="ok" />Sent — broadcast ID: <code>{form.broadcastId}</code></p>
	{/if}

	<section class="list">
		<div class="section-label">// ALL MAILINGS</div>
		{#each data.mailings as m}
			{@const stats = data.opensMap[m.slug]}
			<div class="row">
				<div class="row-meta">
					<span class="date">{fmt(m.date)}</span>
					<span class="published" class:live={m.published}
						>{m.published ? 'PUBLISHED' : 'DRAFT'}</span
					>
					{#if stats}
						<span class="opens">{stats.opens} / {stats.total} OPENED</span>
					{/if}
				</div>
				<div class="row-title">
					<a href="/mailings/{m.slug}" target="_blank">{m.title}</a>
					<small>{m.subject}</small>
				</div>
				<form method="POST" action="?/send" use:enhance class="row-action">
					<input type="hidden" name="slug" value={m.slug} />
					<button type="submit" class="send-btn">SEND TO LIST →</button>
				</form>
			</div>
		{/each}
	</section>
{/if}

<style>
	.hero {
		padding: 40px 0 32px;
		border-bottom: 1px solid var(--rule);
	}
	.eyebrow {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 16px;
	}
	h1 {
		font-weight: 500;
		font-size: clamp(32px, 5vw, 56px);
		line-height: 1;
		letter-spacing: -0.02em;
		margin: 0 0 12px;
	}
	.sub {
		font-size: 15px;
		color: var(--ink-dim);
		line-height: 1.5;
		max-width: 52ch;
		margin: 0 0 12px;
	}
	.sub a {
		color: var(--amber);
	}
	.meta {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.meta b {
		color: var(--ink);
		font-weight: 500;
		margin-right: 4px;
	}
	.section-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
		padding: 24px 0 12px;
	}
	.row {
		display: grid;
		grid-template-columns: 120px 1fr auto;
		gap: 24px;
		align-items: center;
		padding: 16px 0;
		border-bottom: 1px solid var(--rule);

		@media (max-width: 600px) {
			grid-template-columns: 1fr;
			gap: 8px;
		}
	}
	.row-meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-family: var(--mono);
		font-size: var(--t-mono);
	}
	.date {
		color: var(--ink-dim);
		letter-spacing: 0.04em;
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
	.opens {
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--amber);
	}
	.row-title {
		font-size: 17px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	.row-title a {
		color: var(--ink);
		transition: color 0.15s;
	}
	.row-title a:hover {
		color: var(--amber);
	}
	.row-title small {
		display: block;
		font-family: var(--mono);
		font-size: var(--t-mono);
		font-weight: 400;
		color: var(--ink-dim);
		letter-spacing: 0.04em;
		margin-top: 4px;
	}
	.send-btn {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		padding: 8px 14px;
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
	.send-btn:hover {
		border-color: var(--amber);
		color: var(--amber);
	}
	.err,
	.ok {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		padding: 12px 0;
	}
	.err {
		color: var(--danger);
	}
	.ok {
		color: var(--ok);
	}
	code {
		font-family: var(--mono);
		font-size: var(--t-mono);
		background: var(--bg-elev);
		padding: 2px 6px;
		border: 1px solid var(--rule);
	}
</style>
