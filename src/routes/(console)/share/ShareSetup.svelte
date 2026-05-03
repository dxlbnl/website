<script lang="ts">
	type Props = { onstart: (name: string) => void };
	let { onstart }: Props = $props();

	let name: string = $state('');

	function submit() {
		onstart(name.trim() || 'Host');
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
	}
</script>

<div class="panel">
	<p class="hint">Enter your name so the other device can identify you.</p>
	<div class="row">
		<input
			class="field"
			type="text"
			bind:value={name}
			{onkeydown}
			placeholder="Your name (optional)"
			maxlength="32"
		/>
		<button class="btn-primary" onclick={submit}>New session</button>
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 3);
		padding: calc(var(--u) * 4);
		background: var(--bg-elev);
		border: 1px solid var(--rule);
		border-radius: var(--radius-card);
		max-width: 520px;
	}

	.hint {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		margin: 0;
	}

	.row {
		display: flex;
		gap: calc(var(--u) * 1.5);
		flex-wrap: wrap;
	}

	.field {
		flex: 1;
		min-width: 0;
		background: var(--bg-sunken);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		color: var(--ink);
		font-family: var(--mono);
		font-size: var(--t-mono);
		padding: 9px calc(var(--u) * 2);
		outline: none;
		transition: border-color 0.15s;
	}
	.field:focus {
		border-color: var(--amber);
	}
</style>
