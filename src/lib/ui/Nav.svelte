<script lang="ts">
	import { page } from '$app/state';
	import { getPalette, togglePalette } from '$lib/theme.svelte';
	import Led from '$lib/ui/Led.svelte';

	type NavItem = { label: string; href: string };
	const {
		items = [
			{ label: 'FEED', href: '/feed' },
			{ label: 'NOTES', href: '/notes' },
			{ label: 'CATALOGUE', href: '/catalogue' },
			{ label: 'ABOUT', href: '/about' },
			{ label: 'CONTACT', href: '/contact' },
		],
	}: { items?: NavItem[] } = $props();

	function isActive(href: string) {
		return page.url.pathname === href || (href !== '/' && page.url.pathname.startsWith(href));
	}

	const crumbs = $derived(
		page.url.pathname
			.split('/')
			.filter(Boolean)
			.map((s: string, i: number, arr: string[]) => ({
				label: s.toUpperCase(),
				href: '/' + arr.slice(0, i + 1).join('/')
			}))
	);

	let menuEl: HTMLDetailsElement | undefined = $state();

	$effect(() => {
		page.url.pathname;
		menuEl?.removeAttribute('open');
	});
</script>

{#snippet paletteBtn()}
	<button class="toggle" onclick={togglePalette} title="Toggle palette">
		{getPalette() === 'paper' ? '◑' : '◐'}
	</button>
{/snippet}

<nav class="nav">
	<div class="brand">
		<Led tone="ok" />
		<a href="/" class="wordmark">DEXTERLABS</a>
		<span class="path">
			<span class="sep">//</span>
			<a href="/" class="crumb-home">~</a>
			{#each crumbs as crumb}
				<span class="sep">/</span><a href={crumb.href} class="crumb">{crumb.label}</a>
			{/each}
		</span>
	</div>

	<ul>
		{#each items as { label, href }}
			<li><a {href} class:active={isActive(href)}>{label}</a></li>
		{/each}
		<li>{@render paletteBtn()}</li>
	</ul>

	<details bind:this={menuEl}>
		<summary>
			<span class="icon-open">≡</span>
			<span class="icon-close">×</span>
		</summary>
		<div class="dropdown">
			{#each items as { label, href }}
				<a {href} class:active={isActive(href)}>{label}</a>
			{/each}
			{@render paletteBtn()}
		</div>
	</details>
</nav>

<style>
	.nav {
		position: relative;
		display: flex;
		align-items: center;
		gap: 32px;
		padding: 16px 32px;
		border-bottom: 1px solid var(--rule);
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;

		@media (max-width: 720px) {
			padding: 12px 16px;
		}
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		overflow: hidden;
	}
	.wordmark {
		font-weight: 500;
		color: var(--ink);
		letter-spacing: 0.12em;
		white-space: nowrap;
		flex-shrink: 0;
	}
	.path {
		display: flex;
		align-items: center;
		gap: 6px;
		overflow: hidden;
		min-width: 0;

		@media (max-width: 900px) {
			display: none;
		}
	}
	.sep {
		color: var(--ink-faint);
		flex-shrink: 0;
	}
	.crumb-home {
		color: var(--ink-dim);
		flex-shrink: 0;
	}
	.crumb-home:hover {
		color: var(--amber);
	}
	.crumb {
		color: var(--amber);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	a {
		color: var(--ink-dim);
		padding-bottom: 2px;
		border-bottom: 1px solid transparent;
	}
	a:hover,
	a.active {
		color: var(--ink);
		border-color: var(--amber);
	}
	.toggle {
		color: var(--ink-faint);
		font-size: 14px;
		line-height: 1;
		padding-bottom: 2px;
		border-bottom: 1px solid transparent;
	}
	.toggle:hover {
		color: var(--ink);
		border-bottom-color: var(--amber);
	}

	/* desktop nav */
	ul {
		list-style: none;
		margin: 0 0 0 auto;
		padding: 0;
		display: flex;
		gap: 24px;
		align-items: center;
		flex-shrink: 0;
		text-transform: uppercase;

		@media (max-width: 900px) {
			gap: 16px;
		}
		@media (max-width: 720px) {
			display: none;
		}
	}
	details {
		display: none;

		@media (max-width: 720px) {
			display: block;
			margin-left: auto;
			flex-shrink: 0;
		}
	}
	summary {
		list-style: none;
		cursor: pointer;
		font-size: 20px;
		line-height: 1;
		color: var(--ink-dim);
		user-select: none;

		&::-webkit-details-marker {
			display: none;
		}
		&:hover {
			color: var(--ink);
		}
	}
	.icon-close {
		display: none;
	}
	details[open] .icon-open {
		display: none;
	}
	details[open] .icon-close {
		display: inline;
	}
	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: 100;
		background: var(--bg);
		border-bottom: 1px solid var(--rule);
		display: flex;
		flex-direction: column;
		padding: 4px 16px 8px;
		text-transform: uppercase;
	}
	.dropdown a,
	.dropdown .toggle {
		padding: 10px 0;
		border-bottom: 1px solid var(--rule);
		text-align: left;
		display: block;
	}
	.dropdown > :last-child {
		border-bottom: none;
	}
	.dropdown a.active {
		color: var(--amber);
	}
</style>
