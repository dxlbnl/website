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

	function copy(text: string) { navigator.clipboard.writeText(text); }

	$effect(() => {
		void chat.length;
		tick().then(() => { if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight; });
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
								<button class="btn-micro" onclick={() => copy(entry.content)}>Copy</button>
								<button
									class="btn-micro"
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

	<div class="composer">
		<button
			class="icon-btn"
			class:active={isSecret}
			title={isSecret ? 'Secret on' : 'Toggle secret'}
			onclick={() => (isSecret = !isSecret)}
			aria-label="Toggle secret"
		>🔒</button>
		<input type="file" multiple bind:this={fileInput} onchange={onFileChange} style="display:none" />
		<button class="icon-btn" title="Attach file" onclick={() => fileInput?.click()} aria-label="Attach">📎</button>
		<textarea
			class="input"
			bind:value={text}
			{onkeydown}
			placeholder={isSecret ? 'Secret message… (Enter to send)' : 'Message… (Enter to send)'}
			rows="1"
		></textarea>
		<button class="btn-send" onclick={send} disabled={!text.trim()}>Send</button>
	</div>
</div>

<style>
	.wrap {
		display: flex; flex-direction: column; flex: 1;
		background: var(--bg-elev);
		border: 1px solid color-mix(in srgb, var(--ink) 10%, transparent);
		border-radius: var(--radius-card);
		overflow: hidden; min-height: 480px;
		transition: border-color 0.15s;
	}
	.wrap.dragover { border-color: var(--cyan); }

	.header {
		display: flex; align-items: center; gap: calc(var(--u) * 1.5);
		padding: calc(var(--u) * 2) calc(var(--u) * 3);
		border-bottom: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
		font-size: var(--t-sm); color: var(--ink-dim);
	}

	.messages {
		flex: 1; overflow-y: auto;
		padding: calc(var(--u) * 3);
		display: flex; flex-direction: column; gap: calc(var(--u) * 2);
	}

	.msg { display: flex; flex-direction: column; gap: 4px; max-width: 80%; }
	.msg.out { align-self: flex-end; align-items: flex-end; }
	.msg.in  { align-self: flex-start; align-items: flex-start; }

	.bubble {
		background: var(--bg-sunken); border-radius: var(--radius-card);
		padding: calc(var(--u) * 1.5) calc(var(--u) * 2);
		font-size: var(--t-sm); color: var(--ink);
		white-space: pre-wrap; word-break: break-word; line-height: 1.5;
	}
	.msg.out .bubble { background: color-mix(in srgb, var(--cyan) 12%, var(--bg-elev)); }
	.bubble.secret { display: flex; flex-direction: column; gap: calc(var(--u) * 1); }

	.secret-label {
		display: flex; align-items: center; gap: 4px;
		font-size: var(--t-micro); text-transform: uppercase; letter-spacing: 0.08em; color: var(--amber);
	}
	.secret-text { filter: blur(5px); user-select: none; transition: filter 0.1s; word-break: break-all; max-width: 260px; }
	.secret-text.revealed { filter: none; user-select: text; }
	.secret-actions { display: flex; gap: calc(var(--u) * 1); flex-wrap: wrap; }

	.ts { font-size: var(--t-micro); color: var(--ink-faint); }

	.btn-micro {
		background: transparent; color: var(--ink-dim);
		border: 1px solid color-mix(in srgb, var(--ink) 20%, transparent);
		border-radius: var(--radius);
		padding: calc(var(--u) * 0.5) calc(var(--u) * 1.5);
		font-family: inherit; font-size: var(--t-micro); cursor: pointer;
	}
	.btn-micro:hover { color: var(--ink); }

	.composer {
		display: flex; align-items: flex-end; gap: calc(var(--u) * 1);
		padding: calc(var(--u) * 2);
		border-top: 1px solid color-mix(in srgb, var(--ink) 8%, transparent);
	}
	.icon-btn {
		background: transparent; border: none; cursor: pointer;
		font-size: 1.1rem; padding: calc(var(--u) * 0.75);
		border-radius: var(--radius); opacity: 0.6; line-height: 1; flex-shrink: 0;
	}
	.icon-btn:hover, .icon-btn.active { opacity: 1; }
	.icon-btn.active { background: color-mix(in srgb, var(--amber) 15%, transparent); }
	.input {
		flex: 1; background: var(--bg-sunken);
		border: 1px solid color-mix(in srgb, var(--ink) 15%, transparent);
		border-radius: var(--radius); color: var(--ink);
		font-family: inherit; font-size: var(--t-sm);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 2);
		resize: none; outline: none; line-height: 1.5; max-height: 120px; overflow-y: auto;
	}
	.input:focus { border-color: var(--cyan); }
	.btn-send {
		background: var(--cyan); color: var(--bg);
		border: none; border-radius: var(--radius);
		padding: calc(var(--u) * 1.25) calc(var(--u) * 2.5);
		font-family: inherit; font-size: var(--t-sm); font-weight: 600;
		cursor: pointer; white-space: nowrap;
	}
	.btn-send:disabled { opacity: 0.4; cursor: default; }
	.btn-send:not(:disabled):hover { filter: brightness(1.1); }
</style>
