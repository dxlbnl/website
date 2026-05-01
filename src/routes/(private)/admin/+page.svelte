<script lang="ts">
	import { enhance } from '$app/forms';
	import Led from '$lib/ui/Led.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<section class="hero">
	<div class="eyebrow">// ADMIN · ACCESS CONTROL</div>
	<h1>Authenticate.</h1>
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
			<p class="error"><Led tone="danger" />{form.error}</p>
		{/if}
		<button type="submit">ENTER</button>
	</form>
</section>

<style>
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
		font-size: var(--t-hero);
		line-height: 1;
		letter-spacing: -0.03em;
		margin: 0;
	}
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
	button[type='submit'] {
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
	button[type='submit']:hover {
		background: var(--amber);
		color: var(--bg);
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
