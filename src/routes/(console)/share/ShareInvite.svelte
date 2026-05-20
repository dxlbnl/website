<script lang="ts">
	import { Led } from '@dxlbnl/ui';

	type Props = {
		peerName: string;
		onaccept: () => void;
		ondecline: () => void;
	};
	let { peerName, onaccept, ondecline }: Props = $props();
</script>

<div class="panel">
	<div class="status">
		<Led color="amber" blink />
		<strong>{peerName}</strong> is inviting you to connect
	</div>
	<div class="btns">
		<button class="btn-primary" onclick={onaccept}>Accept</button>
		<button class="btn-ghost" onclick={ondecline}>Decline</button>
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

	.btns {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 2);
	}
</style>
