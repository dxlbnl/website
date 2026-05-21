import {
	boolean,
	integer,
	json,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed']);
export const fulfillmentStatusEnum = pgEnum('fulfillment_status', [
	'unfulfilled',
	'shipped',
	'delivered',
	'cancelled'
]);

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
	visitedAt: timestamp('visited_at', { withTimezone: true }).notNull().defaultNow(),
	sessionId: text('session_id'),
	visitorHash: text('visitor_hash'),
	country: text('country'),
	city: text('city'),
	deviceType: text('device_type'),
	os: text('os'),
	browser: text('browser')
});

export const shareSessions = pgTable('share_sessions', {
	id: varchar('id', { length: 8 }).primaryKey(),
	offer: text('offer').notNull(),
	hostName: text('host_name').notNull().default(''),
	hostDeviceId: varchar('host_device_id', { length: 36 }),
	targetDeviceId: varchar('target_device_id', { length: 36 }),
	answer: text('answer'),
	peerName: text('peer_name'),
	guestDeviceId: varchar('guest_device_id', { length: 36 }),
	approved: boolean('approved').notNull().default(false),
	denied: boolean('denied').notNull().default(false),
	ip: varchar('ip', { length: 45 }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const orders = pgTable('orders', {
	id: serial('id').primaryKey(),
	stripeSessionId: text('stripe_session_id').notNull().unique(),
	productId: text('product_id').notNull(),
	priceId: text('price_id').notNull(),
	customerEmail: text('customer_email'),
	amountTotal: integer('amount_total'),
	currency: text('currency'),
	status: paymentStatusEnum('status').notNull().default('pending'),
	shippingName: text('shipping_name'),
	shippingAddress: json('shipping_address').$type<{
		line1: string;
		line2?: string | null;
		city: string;
		state?: string | null;
		postal_code: string;
		country: string;
	}>(),
	isPreorder: boolean('is_preorder').notNull().default(false),
	fulfillmentStatus: fulfillmentStatusEnum('fulfillment_status').notNull().default('unfulfilled'),
	resendEmailId: text('resend_email_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
