<script lang="ts">
	import { Html, Head, Body, Container, Heading, Text, Hr, Link } from 'svelte-email';
	import type { Component } from 'svelte';

	type Props = { title: string; BodyComponent: Component; date: string; unsubscribeMessage?: string };
	let { title, BodyComponent, date, unsubscribeMessage }: Props = $props();

	// Resend replaces this placeholder with the real unsubscribe URL before delivery
	const unsubUrl = 'RESEND_UNSUBSCRIBE_PLACEHOLDER';

	const sans = "'Inter Tight', Inter, ui-sans-serif, system-ui, sans-serif";
	const mono = 'monospace';

	// Site dark theme tokens
	const c = {
		bg: '#0f1211',
		surface: '#141817',
		ink: '#d6e2dc',
		inkDim: '#a4b0a9',
		inkFaint: '#7a8580',
		rule: '#2a3330'
	};
</script>

<Html lang="en">
	<Head>
		<title>{title}</title>
		<style>
			h2 {
				font-family: 'Inter Tight', Inter, ui-sans-serif, system-ui, sans-serif;
				font-size: 22px;
				font-weight: 500;
				letter-spacing: -0.01em;
				color: #d6e2dc;
				margin: 48px 0 8px;
				line-height: 1.2;
			}
			p {
				margin: 0 0 20px;
			}
			a {
				color: #d6e2dc;
				text-decoration: underline;
			}
			hr {
				border: none;
				border-top: 1px solid #2a3330;
				margin: 48px 0;
			}
			img {
				display: block;
				max-width: 100%;
				height: auto;
				outline: none;
				border: none;
				text-decoration: none;
				margin: 28px 0;
			}
		</style>
	</Head>
	<Body style={{ margin: '0', padding: '40px 40px', backgroundColor: c.bg, fontFamily: sans }}>
		<Container style={{ backgroundColor: c.surface, padding: '40px' }}>
			<Text
				style={{
					fontFamily: mono,
					fontSize: '12px',
					letterSpacing: '0.12em',
					color: c.inkFaint,
					textTransform: 'uppercase',
					margin: '0 0 24px'
				}}
			>
				DEXTERLABS · {date}
			</Text>

			<Heading
				as="h1"
				style={{
					fontFamily: sans,
					fontSize: '32px',
					fontWeight: '500',
					letterSpacing: '-0.02em',
					color: c.ink,
					margin: '0 0 32px',
					lineHeight: '1.1'
				}}
			>
				{title}
			</Heading>

			<Hr style={{ borderTop: `1px solid ${c.rule}`, margin: '0 0 32px' }} />

			<div style="font-size:16px;line-height:1.65;color:#a4b0a9;">
				<BodyComponent />
			</div>

			<Hr style={{ borderTop: `1px solid ${c.rule}`, margin: '40px 0 24px' }} />

			<Text
				style={{
					fontFamily: mono,
					fontSize: '12px',
					letterSpacing: '0.08em',
					color: c.inkFaint,
					textTransform: 'uppercase',
					margin: '0'
				}}
			>
				{unsubscribeMessage ?? 'You received this because you subscribed at dxlb.nl.'}
				<Link href="https://dxlb.nl" style={{ color: c.inkFaint, textDecoration: 'none' }}
					>dxlb.nl</Link
				> ·
				<Link href={unsubUrl} style={{ color: c.inkFaint, textDecoration: 'none' }}
					>Unsubscribe</Link
				>.
			</Text>
		</Container>
	</Body>
</Html>
