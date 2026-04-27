<script lang="ts">
	import { Html, Head, Body, Container, Heading, Text, Hr, Link } from 'svelte-email';

	type Props = { title: string; body: string; date: string };
	let { title, body, date }: Props = $props();

	// Resend replaces this placeholder with the real unsubscribe URL before delivery
	const unsubUrl = 'RESEND_UNSUBSCRIBE_PLACEHOLDER';
</script>

<Html lang="en">
	<Head><title>{title}</title></Head>
	<Body
		style={{
			margin: '0',
			padding: '40px 0',
			backgroundColor: '#f5f5f0',
			fontFamily: 'monospace'
		}}
	>
		<Container style={{ backgroundColor: '#ffffff', padding: '40px' }}>
			<Text
				style={{
					fontSize: '11px',
					letterSpacing: '0.12em',
					color: '#999',
					textTransform: 'uppercase',
					margin: '0 0 24px'
				}}
			>
				DEXTERLABS · {date}
			</Text>

			<Heading
				as="h1"
				style={{
					fontSize: '32px',
					fontWeight: '500',
					letterSpacing: '-0.02em',
					color: '#111',
					margin: '0 0 32px',
					lineHeight: '1.1'
				}}
			>
				{title}
			</Heading>

			<Hr style={{ borderTop: '1px solid #e0e0e0', margin: '0 0 32px' }} />

			<div style="font-size:16px;line-height:1.65;color:#444;">{@html body}</div>

			<Hr style={{ borderTop: '1px solid #e0e0e0', margin: '40px 0 24px' }} />

			<Text
				style={{
					fontSize: '11px',
					letterSpacing: '0.08em',
					color: '#999',
					textTransform: 'uppercase',
					margin: '0'
				}}
			>
				You received this because you subscribed at
				<Link href="https://dxlb.nl" style={{ color: '#999', textDecoration: 'none' }}>dxlb.nl</Link
				>.
				<Link href={unsubUrl} style={{ color: '#999', textDecoration: 'none' }}>Unsubscribe</Link>.
			</Text>
		</Container>
	</Body>
</Html>
