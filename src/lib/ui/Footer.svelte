<script lang="ts">
	import SubscribeForm from './SubscribeForm.svelte';
</script>

<footer class="footer">
	<div class="mail-col">
		<h4>// MAIL</h4>
		<div class="faint tagline">Receive updates from the lab.</div>
		<SubscribeForm />
	</div>
	<div>
		<h4>// DEXTERLABS</h4>
		<div>Dexter / maker</div>
		<div class="faint">Est. 2019 · Delft, NL</div>
	</div>
	<div>
		<h4>// LEGAL</h4>
		<ul>
			<li><a href="/legal/privacy">Privacy</a></li>
			<li><a href="/legal/terms">Terms</a></li>
			<li><a href="/legal/shipping">Shipping</a></li>
			<li><a href="/legal/returns">Returns</a></li>
		</ul>
	</div>
	<div>
		<h4>// NET</h4>
		<ul>
			<li>
				<a href="https://github.com/dxlbnl/" target="_blank" rel="noopener">[NET.GH] github</a>
			</li>
			<li>
				<a
					href="https://www.linkedin.com/in/alexander-esselink-414685a/"
					target="_blank"
					rel="noopener">[NET.LI] linkedin</a
				>
			</li>
			<li>
				<a href="https://www.instagram.com/dexterotti/" target="_blank" rel="noopener"
					>[NET.IG] instagram</a
				>
			</li>
		</ul>
	</div>
	<div>
		<h4>// SYS</h4>
		<div>© 2026 DEXTERLABS</div>
		<div class="faint">ALL SYSTEMS OPERATIONAL</div>
	</div>
</footer>

<style>
	.footer {
		margin-top: 80px;
		border-top: 1px solid var(--rule);
		padding: 32px;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 24px;
		font-family: var(--mono);
		font-size: var(--t-mono);
		color: var(--ink-dim);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		container-type: inline-size;
	}
	@media (max-width: 720px) {
		.footer {
			grid-template-columns: repeat(2, 1fr);
		}
		.mail-col {
			grid-column: 1 / -1;
		}
	}
	h4 {
		font-size: var(--t-micro);
		color: var(--ink-faint);
		margin: 0 0 8px;
		font-weight: 500;
		letter-spacing: 0.12em;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	a:hover {
		color: var(--amber);
	}
	.faint {
		color: var(--ink-dim);
	}
	.tagline {
		margin-bottom: 8px;
		text-transform: none;
	}
</style>
