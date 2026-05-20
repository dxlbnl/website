<script lang="ts">
	import { Container, Stack, PageHero, SectionHead, Grid, Text, ProjectCard } from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import { resolveProjectImage, vercelSrcset } from '$lib/utils/image';
	import { resolve } from '$app/paths';
	import type { ProjectFrontmatter } from '$lib/types';

	type Props = { data: { projects: ProjectFrontmatter[] } };
	let { data }: Props = $props();
</script>

<SEO
	title="Projects"
	description="Software projects from the lab — open source tools, experiments, and side ventures."
/>

<Container size="lg">
	<Stack gap="lg">
		<PageHero
			border
			variant="hero"
			eyebrow="// PROJECTS · SOFTWARE"
			heading="Projects."
			lede="Open source tools, experiments, and side ventures. Built by Dexter."
		>
			<Text variant="mono" size="xs" color="faint" case="upper">
				<Text as="span" color="ink">{data.projects.length}</Text> PROJECTS
			</Text>
		</PageHero>

		<SectionHead eyebrow="// INDEX" heading="All projects" />

		<Grid cols={3} gap="sm">
			{#each data.projects as project (project.slug)}
				{@const img = project.image ? resolveProjectImage(project.image) : undefined}
				{@const imgLight = project.imageLight ? resolveProjectImage(project.imageLight) : undefined}
				<ProjectCard
					slug={project.slug}
					title={project.title}
					description={project.description}
					tags={project.tags}
					ctaLabel={project.url ? 'VIEW PROJECT' : 'OPEN SOURCE'}
					href={resolve(`/projects/${project.slug}/`)}
					image={img}
					imageSrcset={img ? vercelSrcset(img, [256, 384, 512, 768, 960]) : undefined}
					imageLight={imgLight}
					imageLightSrcset={imgLight
						? vercelSrcset(imgLight, [256, 384, 512, 768, 960])
						: undefined}
				/>
			{/each}
		</Grid>
	</Stack>
</Container>

<Container size="lg">
	<Signature />
</Container>
