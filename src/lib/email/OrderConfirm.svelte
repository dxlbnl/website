<script lang="ts">
	import { Html, Head, Body, Container, Heading, Text, Hr } from 'svelte-email';

	type Props = {
		productId: string;
		amountTotal: number;
		currency: string;
		customerName?: string;
		isPreorder: boolean;
	};
	let { productId, amountTotal, currency, customerName, isPreorder }: Props = $props();

	const amount = $derived((amountTotal / 100).toFixed(2));
	const symbol = $derived(currency.toLowerCase() === 'eur' ? '€' : currency.toUpperCase());
	const greeting = $derived(customerName ? `Hey ${customerName}, your` : 'Your');

	const subjectPrefix = $derived(isPreorder ? 'Pre-order received' : 'Order received');
	const mainText = $derived(
		isPreorder
			? "Thanks for the support. I'm working hard to get it ready, and I'll make sure to keep you updated as development and assembly progress."
			: "Thanks for the order. I'm getting everything ready for shipment. You'll receive an email with tracking as soon as it leaves the lab."
	);
</script>

<Html lang="en">
	<Head><title>{subjectPrefix} — DEXTERLABS</title></Head>
	<Body
		style={{
			margin: '0',
			padding: '40px 0',
			backgroundColor: '#f5f5f0',
			fontFamily: 'monospace'
		}}
	>
		<Container style={{ backgroundColor: '#ffffff', padding: '40px 40px' }}>
			<Text
				style={{
					fontSize: '11px',
					letterSpacing: '0.12em',
					color: '#999',
					textTransform: 'uppercase',
					margin: '0 0 24px'
				}}
			>
				DEXTERLABS · {subjectPrefix.toUpperCase()}
			</Text>

			<Heading
				as="h1"
				style={{
					fontSize: '32px',
					fontWeight: '500',
					letterSpacing: '-0.02em',
					color: '#111',
					margin: '0 0 16px',
					lineHeight: '1.1'
				}}
			>
				{subjectPrefix}.
			</Heading>

			<Text style={{ fontSize: '16px', lineHeight: '1.6', color: '#444', margin: '0 0 32px' }}>
				{greeting} payment went through. {mainText}
			</Text>

			<Hr style={{ borderTop: '1px solid #e0e0e0', margin: '0 0 24px' }} />

			<table style="width:100%;font-family:monospace;font-size:13px;">
				<tbody>
					<tr>
						<td
							style="padding:8px 0;color:#999;text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid #eee;"
							>Product</td
						>
						<td
							style="padding:8px 0;color:#111;text-align:right;font-weight:500;border-bottom:1px solid #eee;"
							>{productId.toUpperCase()}</td
						>
					</tr>
					<tr>
						<td style="padding:8px 0;color:#999;text-transform:uppercase;letter-spacing:0.08em;"
							>Amount</td
						>
						<td style="padding:8px 0;color:#111;text-align:right;font-weight:500;"
							>{symbol}{amount}</td
						>
					</tr>
				</tbody>
			</table>

			<Hr style={{ borderTop: '1px solid #e0e0e0', margin: '24px 0' }} />

			<Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', margin: '0' }}>
				You'll also receive a receipt from Stripe. Questions? Reply to this email.
			</Text>
		</Container>
	</Body>
</Html>
