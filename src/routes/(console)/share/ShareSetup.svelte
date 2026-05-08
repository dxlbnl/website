<script lang="ts">
	import type { TrustedPeer } from './types';

	type Props = {
		name?: string;
		trustedPeers?: TrustedPeer[];
		nearbySessions?: { id: string; hostName: string; hostDeviceId: string }[];
		onstart: (name: string) => void;
		onjoin?: (id: string) => void;
		isJoining?: boolean;
		onstartdirected?: (peer: TrustedPeer) => void;
		onforget?: (id: string) => void;
	};
	let {
		name = '',
		trustedPeers = [],
		nearbySessions = [],
		onstart,
		onjoin,
		onstartdirected,
		onforget,
		isJoining = false
	}: Props = $props();

	let inputName: string = $state('');

	$effect(() => {
		inputName = name;
	});

	function submit() {
		onstart(inputName.trim() || 'Host');
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') submit();
	}

	// Deduplicate: merge trusted and nearby
	const mergedPeers = $derived(() => {
		const nearbyMap = new Map(nearbySessions.map((s) => [s.hostDeviceId, s]));
		const trustedMap = new Map(trustedPeers.map((p) => [p.id, p]));

		// List of devices we can interact with
		const result: { id: string; name: string; sessionId?: string; isTrusted: boolean }[] = [];

		// Start with trusted devices
		for (const p of trustedPeers) {
			const nearby = nearbyMap.get(p.id);
			result.push({
				id: p.id,
				name: p.name,
				sessionId: nearby?.id,
				isTrusted: true
			});
			nearbyMap.delete(p.id);
		}

		// Add remaining nearby devices (untrusted)
		for (const n of nearbyMap.values()) {
			result.push({
				id: n.hostDeviceId,
				name: n.hostName,
				sessionId: n.id,
				isTrusted: false
			});
		}

		return result;
	});
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
		<button class="btn-primary" onclick={submit}
			>{isJoining ? 'Join session' : 'New session'}</button
		>
	</div>

	{#if !isJoining}
		<div class="status-faint">
			<span class="dot"></span>
			Listening for incoming connections...
		</div>
	{/if}

	{#if mergedPeers().length > 0}
		<div class="trusted">
			<div class="trusted-label">Available devices</div>
			{#each mergedPeers() as peer (peer.id)}
				<div class="peer-row">
					<span class="peer-name">{peer.name}</span>
					{#if peer.sessionId}
						<button class="btn-primary peer-connect" onclick={() => onjoin?.(peer.sessionId!)}
							>Join</button
						>
					{:else}
						<button class="btn-ghost peer-connect" onclick={() => onstartdirected?.({ id: peer.id, name: peer.name })}
							>Connect</button
						>
					{/if}
					{#if peer.isTrusted}
						<button class="btn-del" onclick={() => onforget?.(peer.id)} title="Remove trusted">×</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.status-faint {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--ok);
		box-shadow: 0 0 8px var(--ok);
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		0% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.4;
		}
	}
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
