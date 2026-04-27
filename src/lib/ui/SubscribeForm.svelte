<script lang="ts">
	type Props = { label?: string; buttonText?: string };
	let { label, buttonText = 'SUBSCRIBE →' }: Props = $props();

	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let errorMsg = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!email) return;

		status = 'loading';
		errorMsg = '';

		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message ?? 'Subscribe failed');
			}
			status = 'success';
			email = '';
		} catch (err) {
			status = 'error';
			errorMsg = err instanceof Error ? err.message : 'Something went wrong';
		}
	}
</script>

{#if status === 'success'}
	<div class="ok">// SUBSCRIBED OK</div>
{:else}
	{#if label}<label class="label" for="subscribe-email">{label}</label>{/if}
	<form class="row" onsubmit={submit}>
		<input
			id="subscribe-email"
			type="email"
			name="email"
			placeholder="your@email.com"
			bind:value={email}
			disabled={status === 'loading'}
			autocomplete="email"
			required
		/>
		<button type="submit" disabled={status === 'loading'}>
			{status === 'loading' ? '...' : buttonText}
		</button>
	</form>
	{#if status === 'error'}
		<div class="err">{errorMsg}</div>
	{/if}
{/if}

<style>
	.row {
		display: flex;
		gap: 8px;
		align-items: center;
		flex-wrap: wrap;
	}
	input {
		background: var(--bg-sunken);
		border: 1px solid var(--rule);
		color: var(--ink);
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.04em;
		padding: 6px 10px;
		outline: none;
		width: 220px;
		min-width: 0;
		flex: 1 1 140px;
	}
	input:focus {
		border-color: var(--amber);
	}
	label.label {
		display: block;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.04em;
		margin-bottom: 8px;
	}
	input::placeholder {
		color: var(--ink-faint);
	}
	button {
		background: none;
		border: 1px solid var(--rule);
		color: var(--ink-dim);
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
		padding: 6px 12px;
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}
	button:hover:not(:disabled) {
		color: var(--amber);
		border-color: var(--amber);
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.ok {
		color: var(--ok);
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
	}
	.err {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--danger, #e05c5c);
		letter-spacing: 0.04em;
		margin-top: 4px;
	}
</style>
