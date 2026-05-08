import { db } from "$lib/server/db";
import { emailOpens, mailingBroadcasts } from "$lib/server/db/schema";
import { count } from "drizzle-orm";
import type { Component } from "svelte";
import type { MailingFrontmatter } from "$lib/types";
import type { PageServerLoad } from "./$types";

export const prerender = false;

type MailingModule = {
  default: Component;
  metadata: MailingFrontmatter;
};

const modules = import.meta.glob<MailingModule>("/content/mailings/*.md", { eager: true });

export const load: PageServerLoad = async () => {
  const mailings = Object.entries(modules)
    .map(([path, mod]) => ({ path, ...mod.metadata }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const broadcasts = await db.select().from(mailingBroadcasts);
  const broadcastsMap: Record<
    string,
    { broadcastId: string; sentAt: string; recipientCount: number }
  > = Object.fromEntries(
    broadcasts.map((b) => [
      b.slug,
      {
        broadcastId: b.broadcastId,
        sentAt: b.sentAt.toISOString(),
        recipientCount: b.recipientCount,
      },
    ]),
  );

  const broadcastIdToSlug = Object.fromEntries(broadcasts.map((b) => [b.broadcastId, b.slug]));

  const openRows = await db
    .select({ broadcastId: emailOpens.broadcastId, opens: count() })
    .from(emailOpens)
    .groupBy(emailOpens.broadcastId);

  const opensMap: Record<string, { opens: number; total: number }> = {};
  for (const row of openRows) {
    if (!row.broadcastId) continue;
    const slug = broadcastIdToSlug[row.broadcastId];
    if (slug) {
      opensMap[slug] = {
        opens: row.opens,
        total: broadcastsMap[slug]?.recipientCount ?? 0,
      };
    }
  }

  return { mailings, opensMap, broadcastsMap };
};
