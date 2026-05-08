import Stripe from "stripe";
import { Resend } from "resend";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY,
  RESEND_FROM,
  RESEND_REPLY_TO,
  RESEND_ADMIN_EMAIL,
} from "$env/static/private";
import { eq } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { orders } from "$lib/server/db/schema";
import { renderOrderEmail } from "$lib/email/render";
import type { RequestHandler } from "./$types";

export const prerender = false;
export const trailingSlash = "ignore";

export const POST: RequestHandler = async ({ request }) => {
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-04-22.dahlia" });
  const sig = request.headers.get("stripe-signature");
  if (!sig) error(400, "Missing stripe-signature header");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    error(400, "Invalid webhook signature");
  }

  const session = event.data.object as Stripe.Checkout.Session;

  switch (event.type) {
    case "checkout.session.completed": {
      try {
        // For async payment methods (SEPA, iDEAL, etc.) payment_status may still be 'unpaid'
        const status = session.payment_status === "paid" ? "paid" : "pending";
        const shipping = session.collected_information?.shipping_details;
        const addr = shipping?.address;
        await db
          .insert(orders)
          .values({
            stripeSessionId: session.id,
            productId: session.metadata?.productId ?? "",
            priceId: session.metadata?.priceId ?? "",
            customerEmail: session.customer_details?.email ?? null,
            amountTotal: session.amount_total,
            currency: session.currency,
            status,
            shippingName: shipping?.name ?? null,
            shippingAddress: addr
              ? {
                  line1: addr.line1 ?? "",
                  line2: addr.line2 ?? null,
                  city: addr.city ?? "",
                  state: addr.state ?? null,
                  postal_code: addr.postal_code ?? "",
                  country: addr.country ?? "",
                }
              : null,
            isPreorder: session.metadata?.isPreorder === "true",
          })
          .onConflictDoNothing();

        if (session.customer_details?.email) {
          try {
            const resend = new Resend(RESEND_API_KEY);
            const html = renderOrderEmail({
              productId: session.metadata?.productId ?? "",
              amountTotal: session.amount_total ?? 0,
              currency: session.currency ?? "eur",
              customerName: session.customer_details.name ?? undefined,
              isPreorder: session.metadata?.isPreorder === "true",
            });
            const { data: emailData } = await resend.emails.send({
              from: RESEND_FROM ?? "DEXTERLABS <hello@dxlb.nl>",
              replyTo: RESEND_REPLY_TO || undefined,
              to: session.customer_details.email,
              subject: "Order received - DEXTERLABS",
              html,
            });
            if (emailData?.id) {
              await db
                .update(orders)
                .set({ resendEmailId: emailData.id })
                .where(eq(orders.stripeSessionId, session.id));
            }

            if (RESEND_ADMIN_EMAIL) {
              const addr = session.collected_information?.shipping_details?.address;
              const addrStr = addr
                ? [addr.line1, addr.line2, addr.city, addr.postal_code, addr.country]
                    .filter(Boolean)
                    .join(", ")
                : "unknown";
              const amountStr = `${((session.amount_total ?? 0) / 100).toFixed(2)} ${(session.currency ?? "eur").toUpperCase()}`;
              await resend.emails.send({
                from: RESEND_FROM ?? "DEXTERLABS <hello@dxlb.nl>",
                to: RESEND_ADMIN_EMAIL,
                subject: `New order: ${session.metadata?.productId ?? "unknown"}`,
                text: [
                  `Product: ${session.metadata?.productId ?? "unknown"}`,
                  `Customer: ${session.customer_details?.name ?? "unknown"} <${session.customer_details?.email}>`,
                  `Amount: ${amountStr}`,
                  `Shipping: ${session.collected_information?.shipping_details?.name ?? "unknown"}, ${addrStr}`,
                  `Session: ${session.id}`,
                ].join("\n"),
              });
            }
          } catch (err) {
            console.error("[webhook] order email failed", err);
          }
        }
      } catch (err) {
        console.error("[webhook] failed to process checkout.session.completed", session.id, err);
        throw err;
      }
      break;
    }
    case "checkout.session.async_payment_succeeded":
      await db.update(orders).set({ status: "paid" }).where(eq(orders.stripeSessionId, session.id));
      break;
    case "checkout.session.async_payment_failed":
      await db
        .update(orders)
        .set({ status: "failed" })
        .where(eq(orders.stripeSessionId, session.id));
      break;
  }

  return new Response(null, { status: 200 });
};
