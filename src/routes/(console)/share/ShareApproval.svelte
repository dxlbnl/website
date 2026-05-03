<script lang="ts">
	import Led from '$lib/ui/Led.svelte';

	type Props = { peerName: string; onallow: () => void; ondeny: () => void };
	let { peerName, onallow, ondeny }: Props = $props();
</script>

<div class="panel">
	<div class="status"><Led tone="cyan" /> <strong>{peerName}</strong> wants to connect</div>
	<div class="btns">
		<button class="btn-allow" onclick={onallow}>Allow</button>
		<button class="btn-deny" onclick={ondeny}>Deny</button>
	</div>
</div>

<style>
	.panel {
		display: flex; flex-direction: column; gap: calc(var(--u) * 3);
		padding: calc(var(--u) * 4);
		background: var(--bg-elev);
		border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
		border-radius: var(--radius-card);
	}
	.status { display: flex; align-items: center; gap: calc(var(--u) * 1.5); font-size: var(--t-sm); color: var(--ink-dim); }
	.btns { display: flex; gap: calc(var(--u) * 2); }
	.btn-allow {
		background: var(--cyan); color: var(--bg);
		border: none; border-radius: var(--radius);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 3);
		font-family: inherit; font-size: var(--t-sm); font-weight: 600; cursor: pointer;
	}
	.btn-allow:hover { filter: brightness(1.1); }
	.btn-deny {
		background: transparent; color: var(--danger);
		border: 1px solid var(--danger); border-radius: var(--radius);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 3);
		font-family: inherit; font-size: var(--t-sm); cursor: pointer;
	}
	.btn-deny:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }
</style>
