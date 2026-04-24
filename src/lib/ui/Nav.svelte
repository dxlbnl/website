<script lang="ts">
	import { page } from '$app/state';
	import { getPalette, togglePalette } from '$lib/theme.svelte';
	import Led from '$lib/ui/Led.svelte';

	const items = [
		{ label: 'FEED', href: '/feed' },
		{ label: 'NOTES', href: '/notes' },
		{ label: 'CATALOGUE', href: '/catalogue' },
		{ label: 'ABOUT', href: '/about' },
		{ label: 'CONTACT', href: '/contact' }
	];

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
</script>

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
		<li>
			<button class="toggle" onclick={togglePalette} title="Toggle palette">
				{getPalette() === 'paper' ? '◑' : '◐'}
			</button>
		</li>
	</ul>
</nav>

<style>
	.nav {
		display: flex;
		align-items: center;
		gap: 32px;
		padding: 16px 32px;
		border-bottom: 1px solid var(--rule);
		font-family: var(--mono);
		font-size: var(--t-mono);
		letter-spacing: 0.08em;
	}
	@media (max-width: 720px) {
		.nav {
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
	ul {
		list-style: none;
		margin: 0 0 0 auto;
		padding: 0;
		display: flex;
		gap: 24px;
		align-items: center;
		flex-shrink: 0;
		text-transform: uppercase;
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
		border-color: var(--amber);
	}
	@media (max-width: 900px) {
		ul {
			gap: 16px;
		}
		.path {
			display: none;
		}
	}
</style>
