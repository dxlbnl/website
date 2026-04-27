import { integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const emailOpens = pgTable('email_opens', {
	id: serial('id').primaryKey(),
	resendEmailId: text('resend_email_id').notNull().unique(),
	broadcastId: text('broadcast_id'),
	recipientEmail: text('recipient_email'),
	openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow()
});

export const mailingBroadcasts = pgTable('mailing_broadcasts', {
	id: serial('id').primaryKey(),
	slug: text('slug').notNull(),
	broadcastId: text('broadcast_id').notNull().unique(),
	recipientCount: integer('recipient_count').notNull().default(0),
	sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow()
});

export const pageviews = pgTable('pageviews', {
	id: serial('id').primaryKey(),
	path: text('path').notNull(),
	referrer: text('referrer'),
	visitedAt: timestamp('visited_at', { withTimezone: true }).notNull().defaultNow()
});

export const feedPosts = pgTable('feed_posts', {
	id: serial('id').primaryKey(),
	body: text('body').notNull(),
	date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
	tags: text('tags').array().notNull().default([])
});

export const orders = pgTable('orders', {
	id: serial('id').primaryKey(),
	stripeSessionId: text('stripe_session_id').notNull().unique(),
	productId: text('product_id').notNull(),
	priceId: text('price_id').notNull(),
	customerEmail: text('customer_email'),
	amountTotal: integer('amount_total'),
	currency: text('currency'),
	status: text('status').notNull().default('pending'),
	shippingName: text('shipping_name'),
	shippingAddress: json('shipping_address').$type<{
		line1: string;
		line2?: string | null;
		city: string;
		state?: string | null;
		postal_code: string;
		country: string;
	}>(),
	resendEmailId: text('resend_email_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
