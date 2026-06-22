import "server-only";
import { parseMentions } from "@/lib/mentions";
import { usernameMap } from "@/lib/members/directory";
import { createNotifications } from "./store";
import { pushToUsers } from "@/lib/push/send";

/**
 * Resolve @username mentions in forum text to club members, then create an
 * inbox notification + a push for each mentioned member (excluding the author).
 * Best-effort — call it from `after()` so it never blocks the response.
 */
export async function notifyForumMentions(opts: {
  text: string;
  actorId: string;
  actorName: string;
  url: string;
  where: string; // e.g. "a post" / "a reply"
}): Promise<void> {
  const usernames = parseMentions(opts.text);
  if (usernames.length === 0) return;

  const map = await usernameMap();
  const userIds: string[] = [];
  for (const u of usernames) {
    const m = map.get(u);
    if (m && m.userId !== opts.actorId && !userIds.includes(m.userId)) {
      userIds.push(m.userId);
    }
  }
  if (userIds.length === 0) return;

  const title = `${opts.actorName} mentioned you`;
  await createNotifications(
    userIds.map((uid) => ({
      userId: uid,
      type: "forum_mention",
      actorId: opts.actorId,
      actorName: opts.actorName,
      title,
      body: `In ${opts.where}`,
      url: opts.url,
    })),
  );
  await pushToUsers(userIds, {
    title,
    body: `${opts.actorName} mentioned you in ${opts.where}`,
    url: opts.url,
    tag: "mention",
  });
}
