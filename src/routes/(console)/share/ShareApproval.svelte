<script lang="ts">
	import Led from '$lib/ui/Led.svelte';

	type Props = { peerName: string; onallow: () => void; ondeny: () => void };
	let { peerName, onallow, ondeny }: Props = $props();
</script>

<div class="panel">
	<div class="status"><Led tone="amber" blink /> <strong>{peerName}</strong> wants to connect</div>
	<div class="btns">
		<button class="btn-primary" onclick={onallow}>Allow</button>
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
	}

	.status {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1.5);
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
	}

	.btns {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 2);
	}
</style>
