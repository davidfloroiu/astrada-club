import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { pendingCounts } from "@/lib/network/store";
import { unreadCount } from "@/lib/notifications/store";

export const dynamic = "force-dynamic";

/**
 * Unread badge count for the header bell: pending connection + intro requests
 * plus unread stored notifications (mentions).
 */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ count: 0, incoming: 0, intros: 0, mentions: 0 });
  }
  const [{ incoming, intros }, mentions] = await Promise.all([
    pendingCounts(session.userId),
    unreadCount(session.userId),
  ]);
  return NextResponse.json({
    count: incoming + intros + mentions,
    incoming,
    intros,
    mentions,
  });
}
