import { integer, json, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

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
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
