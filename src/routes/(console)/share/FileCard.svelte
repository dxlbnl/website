<script lang="ts">
	import type { MsgFile } from './types';

	type Props = { entry: MsgFile };
	let { entry }: Props = $props();

	function fmtSize(b: number) {
		if (b < 1024) return `${b} B`;
		if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
		return `${(b / (1024 * 1024)).toFixed(1)} MB`;
	}
</script>

<div class="card">
	{#if entry.blobUrl && entry.mimeType.startsWith('image/')}
		<a href={entry.blobUrl} target="_blank" rel="noopener">
			<img src={entry.blobUrl} alt={entry.name} class="preview-img" />
		</a>
	{:else if entry.blobUrl && entry.mimeType.startsWith('video/')}
		<!-- svelte-ignore a11y_media_has_caption -->
		<video src={entry.blobUrl} controls class="preview-media"></video>
	{:else if entry.blobUrl && entry.mimeType.startsWith('audio/')}
		<audio src={entry.blobUrl} controls class="preview-media"></audio>
	{:else if entry.textPreview}
		<pre class="text-preview">{entry.textPreview}</pre>
	{/if}

	<div class="meta">
		<span class="name">{entry.name}</span>
		<span class="size">{fmtSize(entry.size)}</span>
		{#if entry.progress < 1}
			<div class="bar"><div class="fill" style="width:{entry.progress * 100}%"></div></div>
		{:else if entry.blobUrl}
			<a class="btn-del" href={entry.blobUrl} download={entry.name}>Download</a>
		{/if}
	</div>
</div>

<style>
	.card {
		background: var(--bg-sunken);
		border: 1px solid var(--rule);
		border-radius: var(--radius-card);
		overflow: hidden;
		max-width: 300px;
	}

	.preview-img {
		display: block;
		max-width: 100%;
		max-height: 220px;
		object-fit: cover;
		width: 100%;
	}
	.preview-media {
		display: block;
		max-width: 100%;
		width: 100%;
	}
	.text-preview {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-dim);
		padding: calc(var(--u) * 2);
		margin: 0;
		overflow: auto;
		max-height: 140px;
		border-bottom: 1px solid var(--rule);
		white-space: pre-wrap;
		word-break: break-all;
	}

	.meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: calc(var(--u) * 1.5) calc(var(--u) * 2);
	}
	.name {
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink);
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.size {
		font-family: var(--mono);
		font-size: var(--t-micro);
		color: var(--ink-faint);
	}

	.bar {
		height: 3px;
		background: var(--rule);
		border-radius: 2px;
		overflow: hidden;
	}
	.fill {
		height: 100%;
		background: var(--amber);
		transition: width 0.1s;
	}

	a.btn-del {
		text-decoration: none;
		display: inline-block;
	}
</style>
