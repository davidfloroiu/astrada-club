import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { markAllRead } from "@/lib/notifications/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Mark all of the member's stored notifications as read (clears the bell). */
export async function POST(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await markAllRead(session.userId);
  return NextResponse.json({ ok: true });
}
