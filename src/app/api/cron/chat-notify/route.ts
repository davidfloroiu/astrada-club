import { type NextRequest, NextResponse } from "next/server";
import { whopsdk } from "@/lib/whop/sdk";
import { chatRooms } from "@/lib/whop/config";
import { pushBroadcast } from "@/lib/push/send";
import { getSeen, setSeen, isDbConfigured } from "@/lib/chat/seen-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Chat-notification cron. Whop emits no webhook when a chat message is posted,
 * so we poll each shared community room for new messages and fan out OUR own
 * web + native push. (1:1 / group DMs are private per-user channels and can't be
 * polled this way — those continue to notify via Whop's own app.)
 *
 * Best-effort + config-gated: any room that fails is logged and skipped, never
 * thrown, so a Whop hiccup can't break the cron. Requires the company
 * WHOP_API_KEY to carry the `chat:read` permission.
 *
 * Secured by CRON_SECRET — Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 * Scheduled in vercel.json.
 */
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  // No secret set: allow in dev, refuse in prod (fail closed).
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: NextRequest): Promise<Response> {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured() || !process.env.WHOP_API_KEY) {
    return NextResponse.json({ ok: true, skipped: "not configured" });
  }

  let notified = 0;
  for (const room of chatRooms) {
    try {
      const seen = await getSeen(room.channelId);
      const page = await whopsdk.messages.list({
        channel_id: room.channelId,
        direction: "desc", // newest first
        first: 15,
      });
      const messages = page.data ?? [];
      if (messages.length === 0) continue;

      const newest = messages[0];

      // First time we poll this room: record a baseline and DON'T blast history.
      if (!seen) {
        await setSeen(room.channelId, newest.id, newest.created_at);
        continue;
      }
      if (newest.id === seen.lastMessageId) continue;

      // Messages strictly newer than what we last notified about, with real text.
      const fresh = messages.filter(
        (m) =>
          m.created_at > seen.lastCreatedAt &&
          m.id !== seen.lastMessageId &&
          (m.content?.trim()?.length ?? 0) > 0,
      );

      // Advance the bookmark regardless, so we never re-notify the same messages.
      await setSeen(room.channelId, newest.id, newest.created_at);
      if (fresh.length === 0) continue;

      // One push per room per run, summarized — a busy room can't spam a
      // notification per message. Exclude the most-recent sender from delivery.
      const latest = fresh[0];
      const sender = latest.user?.name || latest.user?.username || "Someone";
      const preview = (latest.content ?? "").replace(/\s+/g, " ").trim().slice(0, 90);
      const body =
        fresh.length > 1
          ? `${sender} and others posted ${fresh.length} new messages`
          : `${sender}: ${preview}`;

      await pushBroadcast(latest.user?.id ?? "", {
        title: `${room.icon ?? "💬"} ${room.name}`,
        body,
        url: `/chat?room=${room.slug}`,
        tag: `chat-${room.slug}`,
      });
      notified++;
    } catch (err) {
      console.error(`[chat-notify] room ${room.slug} failed`, err);
    }
  }

  return NextResponse.json({ ok: true, rooms: chatRooms.length, notified });
}
