import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { pendingCounts } from "@/lib/network/store";

export const dynamic = "force-dynamic";

/** Unread badge count for the header bell: pending connection + intro requests. */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ count: 0, incoming: 0, intros: 0 });
  }
  const { incoming, intros } = await pendingCounts(session.userId);
  return NextResponse.json({ count: incoming + intros, incoming, intros });
}
