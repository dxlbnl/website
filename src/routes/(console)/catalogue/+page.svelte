<script lang="ts">
	import {
		Container,
		Stack,
		Inline,
		Grid,
		Card,
		PageHero,
		SectionHead,
		Heading,
		Button,
		Text,
		ProductCard
	} from '@dxlbnl/ui';
	import SEO from '$lib/ui/SEO.svelte';
	import Signature from '$lib/Signature.svelte';
	import { fmtCents } from '$lib/utils/fmt';
	import { resolveProductImage, vercelSrcset } from '$lib/utils/image';
	import { resolve } from '$app/paths';
	import type { ProductFrontmatter, ProductStatus } from '$lib/types';
	import type { Region } from '$lib/utils/location';

	type Props = { data: { products: ProductFrontmatter[]; region: Region } };
	let { data }: Props = $props();

	const production = $derived(data.products.filter((p) => p.status !== 'sold-out'));
	const archive = $derived(data.products.filter((p) => p.status === 'sold-out'));

	function priceFor(product: ProductFrontmatter): string {
		const cents = data.region === 'World' ? product.priceExcl : product.priceIncl;
		return fmtCents(cents);
	}

	function stockStatus(s: ProductStatus): 'in-stock' | 'coming-soon' | 'out-of-stock' {
		if (s === 'available') return 'in-stock';
		if (s === 'coming-soon') return 'coming-soon';
		return 'out-of-stock';
	}

	function imageFor(product: ProductFrontmatter): string | undefined {
		const raw = product.image ?? product.images?.[0];
		return raw ? resolveProductImage(raw, product.id) : undefined;
	}
</script>

<SEO
	title="Catalogue"
	description="Eurorack modules hand-built in Delft. Small batches, studio-grade quality."
/>

<Container size="lg">
	<PageHero
		variant="hero"
		eyebrow="// CATALOGUE · HARDWARE · FOR SALE"
		heading="Catalogue."
		lede="Professional-grade Eurorack modules and studio tools. Engineered for stability and performance. Built in Delft, shipped worldwide. For custom engineering or prototype development, use the link below."
	>
		<Inline gap="md">
			<Text variant="mono" size="xs" color="faint" case="upper">
				<Text as="span" color="ink">{data.products.length}</Text> MODULES LIVE
			</Text>
			<Text variant="mono" size="xs" color="faint" case="upper">
				<Text as="span" color="ink">BATCH</Text>
				2026-Q2
			</Text>
			<Text variant="mono" size="xs" color="faint" case="upper">
				<Text as="span" color="ink">SHIPS FROM</Text>
				DELFT, NL
			</Text>
		</Inline>
	</PageHero>

	<Stack gap="lg">
		{#if production.length > 0}
			<SectionHead eyebrow="// 0x01" heading="In development" sublabel="ACTIVE PROTOTYPING" />

			<Grid cols={3} gap="sm">
				{#each production as product (product.id)}
					{@const img = imageFor(product)}
					<ProductCard
						sku={product.id}
						name={product.name}
						description={product.description}
						price={priceFor(product)}
						status={stockStatus(product.status)}
						href={resolve(`/catalogue/${product.id}/`)}
						image={img}
						imageSrcset={img ? vercelSrcset(img, [256, 384, 512, 768, 960]) : undefined}
					/>
				{/each}
			</Grid>
		{/if}

		{#if archive.length > 0}
			<SectionHead
				eyebrow={production.length ? '// 0x02' : '// 0x01'}
				heading="Archive"
				sublabel="SOLD OUT / DISCONTINUED"
			/>

			<Grid cols={3} gap="sm">
				{#each archive as product (product.id)}
					{@const img = imageFor(product)}
					<ProductCard
						sku={product.id}
						name={product.name}
						description={product.description}
						price={priceFor(product)}
						status={stockStatus(product.status)}
						href={resolve(`/catalogue/${product.id}/`)}
						image={img}
						imageSrcset={img ? vercelSrcset(img, [256, 384, 512, 768, 960]) : undefined}
					/>
				{/each}
			</Grid>
		{/if}

		<Card style="padding: 28px">
			<Stack gap="md">
				<Stack gap="xs">
					<Text variant="mono" size="xs" color="faint" case="upper">
						// ENGINEERING & PROTOTYPING
					</Text>
					<Heading level={3}>Custom hardware and software development.</Heading>
					<Text color="dim" style="max-width: 62ch">
						I take on a limited number of specialized engineering projects each year. If you have a
						concept that requires PCB design, embedded firmware development, or a functional
						prototype, get in touch to discuss the technical scope and timeline.
					</Text>
				</Stack>
				<Inline>
					<Button as="a" href={resolve('/contact/')} variant="cta">GET IN TOUCH →</Button>
				</Inline>
			</Stack>
		</Card>
	</Stack>
</Container>

<Container size="lg">
	<Signature />
</Container>
