<script lang="ts">
	import { enhance } from '$app/forms';
	import TagPill from '$lib/ui/TagPill.svelte';
	import Led from '$lib/ui/Led.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import { fmtDate } from '$lib/utils/fmt';
	import type { PageData, ActionData } from './$types';

	type Props = { data: PageData; form: ActionData };
	let { data, form }: Props = $props();
</script>

<PageHero
	eyebrow="// ADMIN · FEED CONTROL"
	title="Feed."
	sub="Post directly to the feed - no commit, no redeploy. Wipe anything that ages badly."
>
	<div class="meta">
		<span><b>{data.posts.length}</b> RECORDS</span>
		<form method="POST" action="?/logout" use:enhance>
			<button type="submit" class="logout">DISCONNECT</button>
		</form>
	</div>
</PageHero>

<section class="compose">
	<div class="section-label">// NEW POST</div>
	<form method="POST" action="?/create" use:enhance>
		<textarea name="body" placeholder="What's on the bench..." rows="4" required></textarea>
		<div class="compose-footer">
			<input type="text" name="tags" placeholder="tags, comma separated" />
			<button type="submit" class="btn-ghost">POST</button>
		</div>
		{#if form?.error}<p class="error"><Led tone="danger" />{form.error}</p>{/if}
	</form>
</section>

<section class="log">
	<div class="section-label">// LOG</div>
	{#each data.posts as post (post.id)}
		<div class="entry">
			<span class="date">{fmtDate(post.date)}</span>
			<div class="entry-body">
				<p class="body">{post.body}</p>
				{#if post.tags.length}
					<div class="tags">
						{#each post.tags as tag (tag)}<TagPill>{tag}</TagPill>{/each}
					</div>
				{/if}
			</div>
			<form method="POST" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={post.id} />
				<button type="submit" class="btn-del">DEL</button>
			</form>
		</div>
	{:else}
		<p class="empty">// NO RECORDS</p>
	{/each}
</section>

<style>
	.meta {
		display: flex;
		align-items: center;
		gap: 24px;
		margin-top: 16px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.meta b {
		color: var(--ink);
		font-weight: 500;
	}

	/* sections */
	.section-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.14em;
		color: var(--ink-faint);
		padding: 28px 0 12px;
	}
	.compose form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.compose-footer {
		display: flex;
		gap: 8px;
	}
	.compose-footer input {
		flex: 1;
	}

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
	.entry-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.body {
		margin: 0;
		font-size: var(--t-body);
		line-height: 1.55;
	}
	.tags {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.empty {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-faint);
		padding: 20px 0;
		letter-spacing: 0.08em;
	}

	/* shared inputs */
	textarea,
	input[type='text'] {
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
	textarea:focus,
	input[type='text']:focus {
		border-color: var(--amber);
	}

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
	.logout:hover {
		color: var(--danger);
	}
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
