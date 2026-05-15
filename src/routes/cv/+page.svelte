<script lang="ts">
	import CV from '$lib/ui/CV.svelte';
	import type { Component } from 'svelte';
	import type { CVFrontmatter } from '$lib/types';

	type Props = { data: { component: Component; metadata: CVFrontmatter } };
	let { data }: Props = $props();
</script>

<CV component={data.component} metadata={data.metadata} />
