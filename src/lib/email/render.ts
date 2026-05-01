import { render } from 'svelte/server';
import MailingTemplate from './MailingTemplate.svelte';
import OrderConfirm from './OrderConfirm.svelte';

export type OrderConfirmProps = {
	productId: string;
	amountTotal: number;
	currency: string;
	customerName?: string;
	isPreorder: boolean;
};

// Strip Svelte 5 SSR hydration comment anchors — harmless in browsers but noise in email clients
function clean(html: string): string {
	return html.replace(/<!--\[!?-->|<!--]-->/g, '');
}

export function renderMailingEmail(title: string, body: string, date: string): string {
	const { body: html } = render(MailingTemplate, { props: { title, body, date } });
	return clean(html).replace('RESEND_UNSUBSCRIBE_PLACEHOLDER', '{{{RESEND_UNSUBSCRIBE_URL}}}');
}

export function renderOrderEmail(props: OrderConfirmProps): string {
	const { body: html } = render(OrderConfirm, { props });
	return clean(html);
}
