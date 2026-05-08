import { db } from "$lib/server/db";
import { orders } from "$lib/server/db/schema";
import { desc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const prerender = false;

export const load: PageServerLoad = async () => {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return {
    orders: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  };
};
