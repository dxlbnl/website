<script lang="ts">
	import { enhance } from '$app/forms';
	import TagPill from '$lib/ui/TagPill.svelte';
	import Led from '$lib/ui/Led.svelte';
	import type { PageData, ActionData } from './$types';

	type Props = { data: PageData; form: ActionData };
	let { data, form }: Props = $props();

	function fmt(d: string) {
		return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
	}
</script>

{#if !data.authed}
	<section class="hero">
		<div class="eyebrow">// ADMIN · ACCESS CONTROL</div>
		<h1>Authenticate.</h1>
		<form method="POST" action="?/login" use:enhance class="login-form">
			<div class="prompt">
				<span class="caret">&gt;</span>
				<input type="password" name="token" placeholder="paste token" autocomplete="current-password" />
			</div>
			{#if form?.error}
				<p class="error"><Led tone="danger" />{form.error}</p>
			{/if}
			<button type="submit">ENTER</button>
		</form>
	</section>
{:else}
	<section class="hero">
		<div class="eyebrow">// ADMIN · FEED CONTROL</div>
		<h1>Feed.</h1>
		<p class="sub">Post directly to the feed — no commit, no redeploy. Wipe anything that ages badly.</p>
		<div class="meta">
			<span><b>{data.posts.length}</b> RECORDS</span>
			<form method="POST" action="?/logout" use:enhance>
				<button type="submit" class="logout">DISCONNECT</button>
			</form>
		</div>
	</section>

	<section class="compose">
		<div class="section-label">// NEW POST</div>
		<form method="POST" action="?/create" use:enhance>
			<textarea name="body" placeholder="What's on the bench..." rows="4" required></textarea>
			<div class="compose-footer">
				<input type="text" name="tags" placeholder="tags, comma separated" />
				<button type="submit">POST</button>
			</div>
			{#if form?.error}<p class="error"><Led tone="danger" />{form.error}</p>{/if}
		</form>
	</section>

	<section class="log">
		<div class="section-label">// LOG</div>
		{#each data.posts as post}
			<div class="entry">
				<span class="date">{fmt(post.date)}</span>
				<div class="entry-body">
					<p class="body">{post.body}</p>
					{#if post.tags.length}
						<div class="tags">
							{#each post.tags as tag}<TagPill>{tag}</TagPill>{/each}
						</div>
					{/if}
				</div>
				<form method="POST" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={post.id} />
					<button type="submit" class="del">DEL</button>
				</form>
			</div>
		{:else}
			<p class="empty">// NO RECORDS</p>
		{/each}
	</section>
{/if}

<style>
	/* hero */
	.hero {
		padding: 32px 0;
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
		font-size: clamp(48px, 8vw, 112px);
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0;
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 24px;
		margin-top: 20px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.meta b { color: var(--ink); font-weight: 500; }
	.sub {
		margin-top: 20px;
		font-size: var(--t-lede);
		color: var(--ink-dim);
		max-width: 52ch;
		line-height: 1.55;
	}

	/* login */
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 360px;
		margin-top: 28px;
	}
	.prompt {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--bg-sunken);
		border: 1px solid var(--rule-strong);
		border-radius: var(--radius);
		padding: 0 12px;
	}
	.prompt:focus-within { border-color: var(--amber); }
	.caret {
		font-family: var(--mono);
		color: var(--amber);
		font-size: var(--t-mono);
		flex-shrink: 0;
	}
	.prompt input {
		flex: 1;
		background: none;
		border: none;
		outline: none;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink);
		padding: 11px 0;
		letter-spacing: 0.04em;
		width: 100%;
	}

	/* sections */
	.section-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.14em;
		color: var(--ink-faint);
		padding: 28px 0 12px;
	}
	.compose form { display: flex; flex-direction: column; gap: 8px; }
	.compose-footer { display: flex; gap: 8px; }
	.compose-footer input { flex: 1; }

	/* log */
	.entry {
		display: grid;
		grid-template-columns: 80px 1fr auto;
		gap: 20px;
		align-items: start;
		padding: 14px 0;
		border-bottom: 1px solid var(--rule);
	}
	.date {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--amber);
		letter-spacing: 0.06em;
		padding-top: 2px;
	}
	.entry-body { display: flex; flex-direction: column; gap: 8px; }
	.body { margin: 0; font-size: var(--t-body); line-height: 1.55; }
	.tags { display: flex; gap: 4px; flex-wrap: wrap; }
	.empty {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		padding: 20px 0;
		letter-spacing: 0.08em;
	}

	/* shared inputs */
	textarea, input[type='text'], input[type='password'] {
		width: 100%;
		background: var(--bg-sunken);
		border: 1px solid var(--rule-strong);
		color: var(--ink);
		font-family: var(--sans);
		font-size: var(--t-body);
		padding: 10px 12px;
		border-radius: var(--radius);
		outline: none;
		resize: vertical;
	}
	textarea:focus, input[type='text']:focus { border-color: var(--amber); }

	/* buttons */
	button[type='submit']:not(.del):not(.logout) {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--amber);
		border: 1px solid var(--amber);
		padding: 9px 20px;
		border-radius: var(--radius);
		background: none;
		cursor: pointer;
		white-space: nowrap;
	}
	button[type='submit']:not(.del):not(.logout):hover {
		background: var(--amber);
		color: var(--bg);
	}
	.del {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		color: var(--ink-faint);
		border: 1px solid var(--rule-strong);
		background: none;
		cursor: pointer;
		padding: 3px 7px;
		border-radius: var(--radius);
		margin-top: 2px;
	}
	.del:hover { color: var(--danger); border-color: var(--danger); }
	.logout {
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--ink-faint);
		padding: 0;
	}
	.logout:hover { color: var(--danger); }
	.error {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--danger);
		margin: 0;
	}
</style>
