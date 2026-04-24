<script lang="ts">
	type Props = {
		label?: string;
		shape?: 'sq' | 'tall' | '';
	};
	let { label = 'IMG', shape = '' }: Props = $props();
</script>

<div class="ph" class:sq={shape === 'sq'} class:tall={shape === 'tall'}>{label}</div>

<style>
	.ph {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: repeating-linear-gradient(135deg, var(--bg-sunken) 0 8px, var(--bg-elev) 8px 16px);
		border: 1px solid var(--rule);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		text-transform: uppercase;
	}
	.ph.sq {
		aspect-ratio: 1;
	}
	.ph.tall {
		aspect-ratio: 3 / 4;
	}
</style>
