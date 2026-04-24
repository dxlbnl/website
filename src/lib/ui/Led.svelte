<script lang="ts">
	type Props = {
		tone?: 'ok' | 'amber' | 'cyan' | 'danger' | 'off';
		blink?: boolean;
	};
	let { tone = 'ok', blink = false }: Props = $props();
</script>

<span
	class="led"
	class:amber={tone === 'amber'}
	class:cyan={tone === 'cyan'}
	class:danger={tone === 'danger'}
	class:off={tone === 'off'}
	class:blink
></span>

<style>
	.led {
		display: inline-block;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--ok);
		box-shadow: 0 0 6px var(--ok);
		flex-shrink: 0;
	}
	.led.amber {
		background: var(--amber);
		box-shadow: 0 0 6px var(--amber);
	}
	.led.cyan {
		background: var(--cyan);
		box-shadow: 0 0 6px var(--cyan);
	}
	.led.danger {
		background: var(--danger);
		box-shadow: 0 0 6px var(--danger);
	}
	.led.off {
		background: var(--ink-faint);
		box-shadow: none;
	}
	.blink {
		animation: blink 1.6s steps(2, end) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0.25;
		}
	}
</style>
