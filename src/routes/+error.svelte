<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="error-container">
	<div class="panel">
		<div class="status-bar">
			<div class="led"></div>
			<div class="status-text">SYSTEM.ERROR // CODE_{page.status}</div>
		</div>

		<div class="display">
			<h1>{page.status}</h1>
			<p>{page.error?.message ?? 'UNEXPECTED SYSTEM TERMINATION'}</p>
		</div>

		<div class="actions">
			<a href="/" class="btn">
				<span class="btn-label">[ RETURN TO ROOT ]</span>
			</a>
			<a href="/catalogue/" class="btn">
				<span class="btn-label">[ VIEW CATALOGUE ]</span>
			</a>
		</div>

		<div class="footer-readout">
			<div class="readout-item">REF: ERR_LOG_{page.status}</div>
			<div class="readout-item">SIG: INTERRUPTED</div>
		</div>
	</div>
</div>

<style>
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 80vh;
		background-color: var(--bg);
		color: var(--ink);
		font-family: var(--mono);
	}

	.panel {
		width: 100%;
		max-width: 600px;
		border: 1px solid var(--rule);
		background-color: var(--bg-rail);
		padding: 40px;
		position: relative;
		box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
	}

	.status-bar {
		display: flex;
		align-items: center;
		margin-bottom: 30px;
		border-bottom: 1px solid var(--rule);
		padding-bottom: 15px;
	}

	.led {
		width: 10px;
		height: 10px;
		background-color: var(--danger);
		border-radius: 50%;
		margin-right: 12px;
		box-shadow: 0 0 8px var(--danger);
		animation: blink 1s steps(2, start) infinite;
	}

	@keyframes blink {
		to {
			opacity: 0.2;
		}
	}

	.status-text {
		font-size: var(--t-mono);
		letter-spacing: 1px;
		color: var(--danger);
	}

	.display {
		margin-bottom: 40px;
	}

	h1 {
		font-size: var(--t-h1);
		margin: 0;
		color: var(--ink);
		letter-spacing: -2px;
	}

	p {
		font-size: var(--t-lede);
		color: var(--ink-dim);
		margin-top: 10px;
		text-transform: uppercase;
	}

	.actions {
		display: flex;
		gap: 20px;
		margin-bottom: 30px;
	}

	.btn {
		text-decoration: none;
		color: var(--amber);
		font-weight: bold;
		transition: all 0.2s;
	}

	.btn:hover {
		color: var(--ink);
		text-shadow: 0 0 10px var(--amber);
	}

	.footer-readout {
		display: flex;
		justify-content: space-between;
		font-size: var(--t-micro);
		color: var(--ink-faint);
		border-top: 1px solid var(--rule);
		padding-top: 15px;
	}

	@media (max-width: 600px) {
		.panel {
			padding: 20px;
			border: none;
		}

		h1 {
			font-size: 60px;
		}
	}
</style>
