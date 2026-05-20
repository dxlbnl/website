<script lang="ts">
	import { Led } from '@dxlbnl/ui';

	type Props = {
		peerName: string;
		isTrusted: boolean;
		onallow: (remember: boolean) => void;
		ondeny: () => void;
	};
	let { peerName, isTrusted, onallow, ondeny }: Props = $props();

	let remember: boolean = $state(false);
</script>

<div class="panel">
	<div class="status">
		<Led color="amber" blink />
		<strong>{peerName}</strong> wants to connect
		{#if isTrusted}<span class="badge">known device</span>{/if}
	</div>
	{#if !isTrusted}
		<label class="remember">
			<input type="checkbox" bind:checked={remember} />
			<span>Remember this device</span>
		</label>
	{/if}
	<div class="btns">
		<button class="btn-primary" onclick={() => onallow(remember)}>Allow</button>
		<button class="btn-del" onclick={ondeny}>Deny</button>
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

	.status {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1.5);
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
	}

	.badge {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--amber);
		border: 1px solid var(--amber);
		border-radius: var(--radius);
		padding: 2px 6px;
	}

	.remember {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1.5);
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		cursor: pointer;
	}

	.btns {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 2);
	}
</style>
