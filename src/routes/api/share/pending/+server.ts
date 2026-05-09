import { json, error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { shareSessions } from "$lib/server/db/schema";
import { and, eq, gt, isNull, ne } from "drizzle-orm";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, request }) => {
  const forDevice = url.searchParams.get("for");
  if (!forDevice || forDevice.length < 10) error(400, "Invalid device ID");

  const clientIp = request.headers.get("x-forwarded-for") || "127.0.0.1";
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const freshAndOpen = and(isNull(shareSessions.answer), eq(shareSessions.denied, false), gt(shareSessions.createdAt, fiveMinutesAgo));

  // Directed invites take priority (explicit, time-sensitive)
  const directedInvite = await db
    .select({ id: shareSessions.id, hostName: shareSessions.hostName, hostDeviceId: shareSessions.hostDeviceId })
    .from(shareSessions)
    .where(and(eq(shareSessions.targetDeviceId, forDevice!), freshAndOpen))
    .limit(1);

  // Broadcast invite — only if no directed invite found, never return own sessions
  const broadcastInvite = directedInvite.length === 0
    ? await db
        .select({ id: shareSessions.id, hostName: shareSessions.hostName, hostDeviceId: shareSessions.hostDeviceId })
        .from(shareSessions)
        .where(and(isNull(shareSessions.targetDeviceId), ne(shareSessions.hostDeviceId, forDevice!), freshAndOpen))
        .limit(1)
    : [];

  const invite = directedInvite[0] ?? broadcastInvite[0] ?? null;

  // Find a session we are hosting that is still active/pending
  const hosting = await db
    .select({
      id: shareSessions.id,
      peerName: shareSessions.peerName,
      hasAnswer: shareSessions.answer,
    })
    .from(shareSessions)
    .where(
      and(
        eq(shareSessions.hostDeviceId, forDevice!),
        eq(shareSessions.approved, false),
        eq(shareSessions.denied, false),
        gt(shareSessions.createdAt, fiveMinutesAgo),
      ),
    )
    .limit(1);

  // Find "Nearby" sessions (same IP, public, not yet answered, not denied/cancelled)
  const nearby = await db
    .select({
      id: shareSessions.id,
      hostName: shareSessions.hostName,
      hostDeviceId: shareSessions.hostDeviceId,
    })
    .from(shareSessions)
    .where(
      and(
        eq(shareSessions.ip, clientIp),
        isNull(shareSessions.targetDeviceId),
        isNull(shareSessions.answer),
        eq(shareSessions.denied, false),
        gt(shareSessions.createdAt, fiveMinutesAgo),
      ),
    )
    .limit(3);

  return json({
    invite,
    hosting: hosting[0] ?? null,
    nearby: nearby.filter((n) => n.hostDeviceId !== forDevice),
  });
};
