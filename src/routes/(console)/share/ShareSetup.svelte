<script lang="ts">
	import type { TrustedPeer } from './types';

	type Props = {
		name?: string;
		trustedPeers?: TrustedPeer[];
		onstart: (name: string) => void;
		onstartdirected?: (peer: TrustedPeer) => void;
		onforget?: (id: string) => void;
	};
	let { name = '', trustedPeers = [], onstart, onstartdirected, onforget }: Props = $props();

	let inputName: string = $state('');

	$effect(() => { inputName = name; });

	function submit() {
		onstart(inputName.trim() || 'Host');
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
	}
</script>

<div class="panel">
	<div class="row">
		<input
			class="field"
			type="text"
			bind:value={inputName}
			{onkeydown}
			placeholder="Your name (optional)"
			maxlength="32"
		/>
		<button class="btn-primary" onclick={submit}>New session</button>
	</div>

	{#if trustedPeers.length > 0}
		<div class="trusted">
			<div class="trusted-label">Trusted devices</div>
			{#each trustedPeers as peer (peer.id)}
				<div class="peer-row">
					<span class="peer-name">{peer.name}</span>
					<button class="btn-ghost peer-connect" onclick={() => onstartdirected?.(peer)}>Connect</button>
					<button class="btn-del" onclick={() => onforget?.(peer.id)} title="Remove">×</button>
				</div>
			{/each}
		</div>
	{/if}
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

	.trusted {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 1);
		padding-top: calc(var(--u) * 2);
		border-top: 1px solid var(--rule);
	}

	.trusted-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-bottom: calc(var(--u) * 0.5);
	}

	.peer-row {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1.5);
	}

	.peer-name {
		flex: 1;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
	}

	.peer-connect {
		padding: 5px 14px;
	}
</style>
