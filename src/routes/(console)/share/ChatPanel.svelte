<script lang="ts">
	import { tick } from 'svelte';
	import Led from '$lib/ui/Led.svelte';
	import FileCard from './FileCard.svelte';
	import type { ChatEntry } from './types';

	type Props = {
		peerName: string;
		chat: ChatEntry[];
		onsendtext: (content: string, secret: boolean) => void;
		onsendfiles: (files: File[]) => void;
	};
	let { peerName, chat, onsendtext, onsendfiles }: Props = $props();

	let text: string = $state('');
	let isSecret: boolean = $state(false);
	let revealedIds: string[] = $state([]);
	let dragging: boolean = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);
	let messagesEl: HTMLElement | null = $state(null);
	let textareaEl: HTMLTextAreaElement | null = $state(null);

	function fmtTime(d: Date) {
		return d.toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit' });
	}

	function send() {
		if (!text.trim()) return;
		onsendtext(text.trim(), isSecret);
		text = '';
		isSecret = false;
	}

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
	}

	function onFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files?.length) onsendfiles(Array.from(input.files));
		input.value = '';
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (e.dataTransfer?.files.length) onsendfiles(Array.from(e.dataTransfer.files));
	}

	function toggleReveal(id: string, on: boolean) {
		revealedIds = on ? [...revealedIds, id] : revealedIds.filter((x) => x !== id);
	}

	function copy(content: string) { navigator.clipboard.writeText(content); }

	$effect(() => {
		void chat.length;
		tick().then(() => { if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight; });
	});

	// Auto-grow textarea
	$effect(() => {
		void text;
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = Math.min(textareaEl.scrollHeight, 160) + 'px';
	});
</script>

<div
	class="wrap"
	class:dragover={dragging}
	ondragover={(e) => { e.preventDefault(); dragging = true; }}
	ondragleave={() => (dragging = false)}
	ondrop={onDrop}
	role="region"
	aria-label="Chat"
>
	<div class="header">
		<Led tone="ok" />
		<span>Connected to <strong>{peerName}</strong></span>
	</div>

	<div class="messages" bind:this={messagesEl}>
		{#each chat as entry (entry.id)}
			<div class="msg" class:out={entry.dir === 'out'} class:in={entry.dir === 'in'}>
				{#if entry.kind === 'text'}
					<div class="bubble" class:secret={entry.secret}>
						{#if entry.secret}
							<span class="secret-label"><Led tone="amber" /> Secret</span>
							<span class="secret-text" class:revealed={revealedIds.includes(entry.id)}>{entry.content}</span>
							<div class="secret-actions">
								<button class="btn-del" onclick={() => copy(entry.content)}>Copy</button>
								<button
									class="btn-del"
									onmousedown={() => toggleReveal(entry.id, true)}
									onmouseup={() => toggleReveal(entry.id, false)}
									onmouseleave={() => toggleReveal(entry.id, false)}
								>Hold to reveal</button>
							</div>
						{:else}
							{entry.content}
						{/if}
					</div>
				{:else}
					<FileCard {entry} />
				{/if}
				<span class="ts">{fmtTime(entry.ts)}</span>
			</div>
		{/each}
	</div>

	<div class="composer" class:secret-mode={isSecret}>
		{#if isSecret}
			<input
				type="password"
				class="field"
				bind:value={text}
				onkeydown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
				placeholder="Secret message…"
			/>
		{:else}
			<textarea
				class="field"
				bind:value={text}
				bind:this={textareaEl}
				{onkeydown}
				placeholder="Message… (Shift+Enter for newline)"
				rows="1"
			></textarea>
		{/if}
		<div class="actions">
			<input type="file" multiple bind:this={fileInput} onchange={onFileChange} style="display:none" />
			<button class="action-btn" onclick={() => fileInput?.click()} title="Attach file">↑ Attach</button>
			<button
				class="action-btn"
				class:active={isSecret}
				onclick={() => (isSecret = !isSecret)}
				title={isSecret ? 'Disable secret mode' : 'Send as secret (blurred)'}
			>{isSecret ? '× Secret' : '+ Secret'}</button>
			<button class="btn-primary send-btn" onclick={send} disabled={!text.trim()}>Send</button>
		</div>
	</div>
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		flex: 1;
		background: var(--bg-elev);
		border: 1px solid var(--rule);
		border-radius: var(--radius-card);
		overflow: hidden;
		min-height: 480px;
		transition: border-color 0.15s;
	}
	.wrap.dragover {
		border-color: var(--amber);
	}

	.header {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1.5);
		padding: calc(var(--u) * 2) calc(var(--u) * 3);
		border-bottom: 1px solid var(--rule);
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
	}

	.messages {
		flex: 1;
		overflow-y: auto;
		padding: calc(var(--u) * 3);
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 2);
	}

	.msg {
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-width: 80%;
	}
	.msg.out { align-self: flex-end; align-items: flex-end; }
	.msg.in  { align-self: flex-start; align-items: flex-start; }

	.bubble {
		background: var(--bg-sunken);
		border: 1px solid var(--rule);
		border-radius: var(--radius-card);
		padding: calc(var(--u) * 1.5) calc(var(--u) * 2);
		font-size: var(--t-body);
		color: var(--ink);
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.5;
	}
	.msg.out .bubble {
		background: var(--bg-elev);
		border-color: var(--rule-strong);
	}
	.bubble.secret {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 1);
	}

	.secret-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: var(--mono);
		font-size: var(--t-micro);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--amber);
	}
	.secret-text {
		filter: blur(5px);
		user-select: none;
		transition: filter 0.1s;
		word-break: break-all;
		max-width: 260px;
	}
	.secret-text.revealed {
		filter: none;
		user-select: text;
	}
	.secret-actions {
		display: flex;
		gap: calc(var(--u) * 1);
		flex-wrap: wrap;
	}

	.ts {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
	}

	.composer {
		display: flex;
		flex-direction: column;
		gap: calc(var(--u) * 1);
		padding: calc(var(--u) * 2);
		border-top: 1px solid var(--rule);
		transition: border-color 0.15s;
	}
	.composer.secret-mode {
		border-top-color: var(--amber);
	}

	.field {
		width: 100%;
		background: var(--bg-sunken);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		color: var(--ink);
		font-family: var(--mono);
		font-size: var(--t-mono);
		padding: 9px calc(var(--u) * 2);
		resize: none;
		outline: none;
		line-height: 1.5;
		overflow-y: hidden;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}
	.field:focus {
		border-color: var(--amber);
	}
	.composer.secret-mode .field {
		border-color: var(--amber);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: calc(var(--u) * 1);
	}

	.action-btn {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.08em;
		background: transparent;
		border: 1px solid var(--rule);
		border-radius: var(--radius);
		color: var(--ink-faint);
		cursor: pointer;
		padding: 4px 8px;
		flex-shrink: 0;
		transition: color 0.15s, border-color 0.15s;
	}
	.action-btn:hover {
		color: var(--ink-dim);
		border-color: var(--rule-strong);
	}
	.action-btn.active {
		color: var(--amber);
		border-color: var(--amber);
	}

	.send-btn {
		margin-left: auto;
	}
</style>
