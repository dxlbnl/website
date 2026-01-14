<script lang="ts">
	type Props = {
		title: string;
		description?: string;
	};

	let { title, description }: Props = $props();
</script>

<header class="page-header">
	<h1 class="page-title">{title}</h1>
	{#if description}
		<p class="page-description">{description}</p>
	{/if}
</header>

<style>
	.page-header {
		margin: 3rem 0;
	}

	.page-title {
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 900;
		margin: 0;
		color: var(--text-main);
		text-shadow:
			2px 0 var(--cyber-red),
			-2px 0 var(--cyber-cyan);
	}

	.page-description {
		color: var(--text-dim);
		font-size: 0.85rem;
		letter-spacing: 2px;
		margin: 1rem 0 0 0;
	}
</style>
