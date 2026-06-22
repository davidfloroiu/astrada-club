import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { listMembers } from "@/lib/members/directory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The club directory (minus the signed-in member) — used by the group-chat picker. */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const members = (await listMembers()).filter(
    (m) => m.userId !== session.userId,
  );
  return NextResponse.json({ members });
}
