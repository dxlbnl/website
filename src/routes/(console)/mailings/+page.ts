import type { MailingFrontmatter } from "$lib/types";
import type { PageLoad } from "./$types";

type MailingModule = { metadata: MailingFrontmatter };

const modules = import.meta.glob<MailingModule>("/content/mailings/*.md", { eager: true });

export const load: PageLoad = async () => {
  const entries = Object.values(modules)
    .map((mod) => mod.metadata)
    .filter((m) => m.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { entries };
};
