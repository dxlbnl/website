import { json, error } from "@sveltejs/kit";
import { z } from "zod";
import { db } from "$lib/server/db";
import { shareSessions } from "$lib/server/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { RequestHandler } from "./$types";

const schema = z.object({
  offer: z.string().min(10),
  hostName: z.string().max(64).default("Host"),
  hostDeviceId: z.string().min(10).optional(),
  targetDeviceId: z.string().min(10).optional(),
});

export const POST: RequestHandler = async ({ request }) => {
  const result = schema.safeParse(await request.json());
  if (!result.success) error(400, "Invalid input");

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  await db.delete(shareSessions).where(lt(shareSessions.createdAt, fiveMinutesAgo));

  if (result.data.hostDeviceId && result.data.targetDeviceId) {
    await db
      .delete(shareSessions)
      .where(
        and(
          eq(shareSessions.hostDeviceId, result.data.hostDeviceId),
          eq(shareSessions.targetDeviceId, result.data.targetDeviceId),
        ),
      );
  }

  const id = nanoid(8);
  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

  await db.insert(shareSessions).values({
    id,
    offer: result.data.offer,
    hostName: result.data.hostName,
    hostDeviceId: result.data.hostDeviceId,
    targetDeviceId: result.data.targetDeviceId,
    ip,
  });

  return json({ id });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { hostDeviceId } = (await request.json()) as { hostDeviceId: string };
  if (!hostDeviceId) error(400, "Missing hostDeviceId");

  await db.delete(shareSessions).where(eq(shareSessions.hostDeviceId, hostDeviceId));
  return json({ ok: true });
};
