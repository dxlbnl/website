<script>
	import SectionH from '$lib/ui/SectionH.svelte';
	import Signature from '$lib/ui/Signature.svelte';
	import SEO from '$lib/ui/SEO.svelte';
	import PageHero from '$lib/ui/PageHero.svelte';
</script>

<SEO
	title="About"
	description="Dexter - hardware and software engineer, Eurorack builder, based in Delft. The story behind Dexterlabs."
/>

<div class="wrap">
	<PageHero eyebrow="// ABOUT · DEXTER / DEXTERLABS">
		{#snippet headingContent()}Two names,<br /><em>one lab.</em>{/snippet}
	</PageHero>

	<div class="split">
		<div class="col">
			<div class="col-label">// 0x01 · THE PERSON</div>
			<h2>Dexter.</h2>
			<p>
				Alexander "Dexter" Esselink. Software engineer. Hardware designer. I draft the schematics,
				write the firmware, and solder the boards.
			</p>
			<p class="dim">Based in Delft. Building tools for the studio and the web.</p>
		</div>
		<div class="col">
			<div class="col-label">// 0x02 · THE LAB</div>
			<h2>Dexterlabs.</h2>
			<p>
				A one-person engineering lab. No fixed brief - hardware, software, whatever needs building.
				This site serves as the showcase for completed products and the logbook for the process.
			</p>
			<p class="dim">Est. 2019. Still small on purpose.</p>
		</div>
	</div>

	<SectionH num="// 0x03" title="What this site is" sub="AND ISN'T" />

	<div class="is-grid">
		<div>
			<div class="is-label ok">// IS</div>
			<ul>
				<li>A showcase - the modules and hardware that are ready for the rack.</li>
				<li>A logbook - notes on experiments, schematics, and side-projects.</li>
			</ul>
		</div>
		<div>
			<div class="is-label faint">// ISN'T</div>
			<ul class="isnt">
				<li>A client portfolio - that's my day job, not this.</li>
				<li>A content mill - no publishing schedules, no SEO pressure.</li>
				<li>A startup pitch - this is an engineering lab, not a tech company.</li>
			</ul>
		</div>
	</div>

	<Signature />
</div>

<style>
	.wrap {
		max-width: 1440px;
		margin: 0 auto;
		padding: 0 32px 80px;
		container-type: inline-size;

		@media (max-width: 720px) {
			padding: 0 16px 56px;
		}
	}
	/* Two-col person/lab */
	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 32px;
		padding: 32px 0;
		border-bottom: 1px solid var(--rule);

		@container (max-width: 720px) {
			grid-template-columns: 1fr;
			gap: 40px;
		}
	}
	.col-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		color: var(--ink-faint);
		margin-bottom: 12px;
	}
	h2 {
		font-weight: 500;
		font-size: var(--t-h2);
		letter-spacing: -0.01em;
		margin: 0 0 16px;
	}
	p {
		font-size: var(--t-body);
		line-height: 1.6;
		max-width: 52ch;
		margin-bottom: 12px;
	}
	p.dim {
		color: var(--ink-dim);
		font-size: var(--t-body);
	}

	/* Is / isn't grid */
	.is-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
		padding: 20px 0 8px;
		font-size: var(--t-body);
		line-height: 1.6;

		@container (max-width: 720px) {
			grid-template-columns: 1fr;
		}
	}
	.is-label {
		font-family: var(--mono);
		font-size: var(--t-micro);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		margin-bottom: 12px;
	}
	.is-label.ok {
		color: var(--ok);
	}
	.is-label.faint {
		color: var(--danger);
	}
	ul {
		padding-left: 18px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	ul.isnt {
		color: var(--ink-dim);
	}
</style>
