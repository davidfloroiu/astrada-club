import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { getConnectedIds } from "@/lib/network/store";
import { memberMap } from "@/lib/members/directory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The signed-in member's connections (as directory entries) — for the DM picker. */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [ids, map] = await Promise.all([
    getConnectedIds(session.userId),
    memberMap(),
  ]);
  const members = ids
    .map((id) => map.get(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  return NextResponse.json({ members });
}
