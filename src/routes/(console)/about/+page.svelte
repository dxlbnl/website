<script lang="ts">
	import {
		Container,
		Stack,
		Grid,
		PageHero,
		SectionHead,
		Heading,
		Text,
		Prose,
		Rule
	} from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
</script>

<SEO
	title="About"
	description="Dexter - hardware and software engineer, Eurorack builder, based in Delft. The story behind Dexterlabs."
/>

<Container size="lg">
	<Stack gap="lg">
		<PageHero variant="hero" eyebrow="// ABOUT · DEXTER / DEXTERLABS">
			{#snippet heading()}Two names,<br /><em>one lab.</em>{/snippet}
		</PageHero>

		<Grid cols={2} gap="lg">
			<Stack gap="sm">
				<Text variant="mono" size="xs" color="faint" case="upper">// 0x01 · THE PERSON</Text>
				<Heading level={2}>Dexter.</Heading>
				<Text>
					Alexander "Dexter" Esselink. Software engineer. Hardware designer. I draft the
					schematics, write the firmware, and solder the boards.
				</Text>
				<Text color="dim">Based in Delft. Building tools for the studio and the web.</Text>
			</Stack>
			<Stack gap="sm">
				<Text variant="mono" size="xs" color="faint" case="upper">// 0x02 · THE LAB</Text>
				<Heading level={2}>Dexterlabs.</Heading>
				<Text>
					A one-person engineering lab. No fixed brief - hardware, software, whatever needs
					building. This site serves as the showcase for completed products and the logbook for the
					process.
				</Text>
				<Text color="dim">Est. 2019. Still small on purpose.</Text>
			</Stack>
		</Grid>

		<Rule />

		<SectionHead eyebrow="// 0x03" heading="What this site is" sublabel="AND ISN'T" />

		<Grid cols={2} gap="md">
			<Stack gap="sm">
				<Text variant="mono" size="xs" color="ok" case="upper">// IS</Text>
				<Prose as="div">
					<ul>
						<li>A showcase - the modules and hardware that are ready for the rack.</li>
						<li>A logbook - notes on experiments, schematics, and side-projects.</li>
					</ul>
				</Prose>
			</Stack>
			<Stack gap="sm">
				<Text variant="mono" size="xs" color="danger" case="upper">// ISN'T</Text>
				<Prose as="div">
					<ul>
						<li>A client portfolio - that's my day job, not this.</li>
						<li>A content mill - no publishing schedules, no SEO pressure.</li>
						<li>A startup pitch - this is an engineering lab, not a tech company.</li>
					</ul>
				</Prose>
			</Stack>
		</Grid>

		<Signature />
	</Stack>
</Container>
