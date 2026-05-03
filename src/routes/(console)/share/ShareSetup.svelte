<script lang="ts">
	type Props = { onstart: (name: string) => void };
	let { onstart }: Props = $props();

	let name: string = $state('');
</script>

<div class="panel">
	<h1 class="title">Share</h1>
	<p class="sub">Send text or files peer-to-peer. Nothing stored on the server.</p>
	<div class="row">
		<input class="input" bind:value={name} placeholder="Your name (optional)" maxlength="64" />
		<button class="btn-primary" onclick={() => onstart(name.trim() || 'Host')}>New session</button>
	</div>
</div>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 3);
		padding: calc(var(--u) * 4);
		background: var(--bg-elev);
		border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
		border-radius: var(--radius-card);
	}
	.title { font-size: var(--t-xl); font-weight: 600; color: var(--ink); margin: 0; }
	.sub { color: var(--ink-dim); font-size: var(--t-sm); margin: 0; }
	.row { display: flex; gap: calc(var(--u) * 1.5); flex-wrap: wrap; }
	.input {
		flex: 1; min-width: 0;
		background: var(--bg-sunken);
		border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
		border-radius: var(--radius);
		color: var(--ink); font-family: inherit; font-size: var(--t-sm);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 2);
		outline: none;
	}
	.input:focus { border-color: var(--cyan); }
	.btn-primary {
		background: var(--cyan); color: var(--bg);
		border: none; border-radius: var(--radius);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 3);
		font-family: inherit; font-size: var(--t-sm); font-weight: 600;
		cursor: pointer; white-space: nowrap;
	}
	.btn-primary:hover { filter: brightness(1.1); }
</style>
