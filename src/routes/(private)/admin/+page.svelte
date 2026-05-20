<script lang="ts">
	import { enhance } from '$app/forms';
	import { Led, PageHero } from '@dxlbnl/ui';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<PageHero eyebrow="// ADMIN · ACCESS CONTROL" heading="Authenticate.">
	<form method="POST" action="?/login" use:enhance class="login-form">
		<div class="prompt">
			<span class="caret">&gt;</span>
			<input
				type="password"
				name="token"
				placeholder="paste token"
				autocomplete="current-password"
			/>
		</div>
		{#if form?.error}
			<p class="error"><Led color="danger" />{form.error}</p>
		{/if}
		<button type="submit" class="btn-ghost">ENTER</button>
	</form>
</PageHero>

<style>
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
	.prompt:focus-within {
		border-color: var(--amber);
	}
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
