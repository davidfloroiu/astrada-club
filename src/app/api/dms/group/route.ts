import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { whopsdk } from "@/lib/whop/sdk";
import { whop } from "@/lib/whop/config";
import { listMembers } from "@/lib/members/directory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create a group chat — a Whop DM channel with the signed-in member plus the
 * selected members, and an optional name. Group chats are just multi-person DM
 * channels, so the new group shows up in the member's Messages inbox and opens
 * in the same embed (deep-linked via /messages?c=<id>).
 */
export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { userIds?: unknown; name?: unknown };
  try {
    body = (await request.json()) as { userIds?: unknown; name?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const raw = Array.isArray(body.userIds) ? body.userIds : [];
  const others = [
    ...new Set(
      raw
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter(Boolean),
    ),
  ].filter((id) => id !== session.userId);

  // A group needs the creator + at least two others (two people is just a DM).
  if (others.length < 2) {
    return NextResponse.json(
      { error: "Pick at least two members for a group." },
      { status: 422 },
    );
  }
  if (others.length > 50) {
    return NextResponse.json(
      { error: "Groups are capped at 50 members." },
      { status: 422 },
    );
  }

  // Only club members can be pulled into a group — don't let arbitrary (or
  // non-member) Whop user ids be force-added to a channel. The picker is fed by
  // this same directory, so any legitimate selection passes.
  const directory = await listMembers();
  const memberIds = new Set(directory.map((m) => m.userId));
  if (others.some((id) => !memberIds.has(id))) {
    return NextResponse.json(
      { error: "Everyone in a group must be a club member." },
      { status: 403 },
    );
  }

  const name =
    typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";

  try {
    const channel = await whopsdk.dmChannels.create({
      with_user_ids: [session.userId, ...others],
      company_id: whop.companyId,
      custom_name: name || undefined,
    });
    return NextResponse.json({ channelId: channel.id });
  } catch (err) {
    console.error("[dms] create group failed", err);
    return NextResponse.json(
      { error: "Couldn't create the group." },
      { status: 502 },
    );
  }
}
