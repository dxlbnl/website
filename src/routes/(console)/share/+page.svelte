<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import Led from '$lib/ui/Led.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import ShareSetup from './ShareSetup.svelte';
	import ShareWaiting from './ShareWaiting.svelte';
	import ShareApproval from './ShareApproval.svelte';
	import ShareInvite from './ShareInvite.svelte';
	import ChatPanel from './ChatPanel.svelte';
	import { createShare } from './share.svelte.ts';

	const share = createShare();

	onMount(() => share.init());
	onDestroy(() => share.destroy());

	// Handle ?s= session URL on load / URL change
	$effect(() => {
		const s = page.url.searchParams.get('s');
		if (s && share.phase === 'idle' && share.myDeviceId) share.handleUrlJoin(s);
	});

	// Start pending poll once device is ready and no session URL is present
	$effect(() => {
		if (share.myDeviceId && !page.url.searchParams.get('s')) share.startPendingPoll();
	});

	/**
	 * Resets share state AND updates SvelteKit's page.url to remove ?s=.
	 * history.replaceState alone doesn't update page.url, so the ?s= $effect
	 * would re-fire after reset and re-attempt the same failing session.
	 */
	function handleReset() {
		share.reset();
		if (page.url.searchParams.size > 0) {
			replaceState(location.pathname, {});
		}
	}
</script>

<SEO
	title="Share"
	description="Send text or files directly to another device. Peer-to-peer, nothing stored."
/>

<div class="wrap">
	<PageHero
		eyebrow="// TOOLS · SHARE"
		title="Share."
		sub="Easily share text and files across your devices — nothing is stored on the server."
	/>

	{#if share.phase === 'idle'}
		<ShareSetup
			name={share.myName}
			trustedPeers={share.trustedPeers}
			nearbySessions={share.nearbySessions}
			onstart={(name) => share.startSession(name)}
			onjoin={(id) => share.joinSession(id, share.myName || 'Guest')}
			onstartdirected={(peer) => share.startSession(share.myName || 'Host', peer.id)}
			onforget={share.removeTrusted}
		/>
	{:else if share.phase === 'guest-setup'}
		<ShareSetup
			name={share.myName}
			trustedPeers={share.trustedPeers}
			isJoining={true}
			onstart={share.startGuestSession}
			onforget={share.removeTrusted}
		/>
	{:else if share.phase === 'offering' || share.phase === 'guest-init' || share.phase === 'guest-answering' || share.phase === 'connecting'}
		<div class="status">
			<Led tone="amber" blink />
			<span>
				{share.phase === 'offering'
					? 'Setting up connection…'
					: share.phase === 'guest-answering'
						? 'Creating answer…'
						: share.phase === 'connecting'
							? 'Establishing connection…'
							: 'Connecting…'}
			</span>
			<button class="btn-back" onclick={handleReset} style="margin-left: auto;">cancel</button>
		</div>
	{:else if share.phase === 'waiting'}
		<ShareWaiting
			shareUrl={share.shareUrl}
			targetPeerName={share.directedTo
				? share.trustedPeers.find((p) => p.id === share.directedTo)?.name || 'trusted peer'
				: undefined}
			onanswer={share.resumeFromPastedAnswer}
		/>
		<div style="margin-top: 12px;">
			<button class="btn-ghost" onclick={handleReset}>← cancel session</button>
		</div>
	{:else if share.phase === 'guest-invited'}
		<ShareInvite
			peerName={share.approvalPeerName}
			onaccept={() => share.joinSession(share.sessionId, share.myName || 'Guest')}
			ondecline={share.declineInvite}
		/>
	{:else if share.phase === 'approving'}
		<ShareApproval
			peerName={share.approvalPeerName}
			isTrusted={share.isTrusted(share.approvalPeerDeviceId)}
			onallow={(remember) => share.approveGuest(remember)}
			ondeny={share.denyGuest}
		/>
	{:else if share.phase === 'guest-waiting'}
		<div class="status">
			<Led tone="amber" blink />
			<span>Waiting for host approval…</span>
			<button class="btn-back" onclick={handleReset} style="margin-left: auto;">cancel</button>
		</div>
	{:else if share.phase === 'denied'}
		<div class="status">
			<Led tone="danger" />
			<span>Connection was declined.</span>
			<button class="btn-back" onclick={handleReset} style="margin-left: auto;">↩ try again</button>
		</div>
	{:else if share.phase === 'error'}
		<div class="status">
			<Led tone="danger" /> <span>{share.errorMsg}</span>
			<button class="btn-back" onclick={handleReset} style="margin-left: auto;">↩ try again</button>
		</div>
	{/if}

	{#if share.phase === 'connected'}
		<ChatPanel
			peerName={share.peerName}
			chat={share.chat}
			isReconnecting={share.isReconnecting}
			onsendtext={share.sendText}
			onsendfiles={share.sendFiles}
		/>
	{/if}
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
		container-type: inline-size;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}

	.status {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 24px 0;
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.06em;
		color: var(--ink-dim);
		border-bottom: 1px solid var(--rule);
	}
</style>
