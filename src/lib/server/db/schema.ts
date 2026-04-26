import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const feedPosts = pgTable('feed_posts', {
	id: serial('id').primaryKey(),
	body: text('body').notNull(),
	date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
	tags: text('tags').array().notNull().default([]),
});
