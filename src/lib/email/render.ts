import { render } from "svelte/server";
import MailingTemplate from "./MailingTemplate.svelte";
import OrderConfirm from "./OrderConfirm.svelte";
import { emailImgUrl } from "./image";

export type OrderConfirmProps = {
  productId: string;
  amountTotal: number;
  currency: string;
  customerName?: string;
  isPreorder: boolean;
};

// Strip Svelte 5 SSR hydration comment anchors - harmless in browsers but noise in email clients
function clean(html: string): string {
  return html.replace(/<!--\[!?-->|<!--]-->/g, "");
}

// Rewrite relative img src paths through Vercel image optimization at 600px
function absolutifyImages(html: string): string {
  return html.replace(
    /(<img\s[^>]*src=")(\/[^"]+)"/g,
    (_, tag, path) => `${tag}${emailImgUrl(path)}"`,
  );
}

export function renderMailingEmail(
  title: string,
  bodyComponent: import("svelte").Component,
  date: string,
  unsubscribeMessage?: string,
): string {
  const { body: html } = render(MailingTemplate, {
    props: { title, BodyComponent: bodyComponent, date, unsubscribeMessage },
  });
  return absolutifyImages(clean(html)).replace(
    "RESEND_UNSUBSCRIBE_PLACEHOLDER",
    "{{{RESEND_UNSUBSCRIBE_URL}}}",
  );
}

export function renderOrderEmail(props: OrderConfirmProps): string {
  const { body: html } = render(OrderConfirm, { props });
  return clean(html);
}
