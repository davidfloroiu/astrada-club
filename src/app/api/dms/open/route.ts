import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { whopsdk } from "@/lib/whop/sdk";
import { whop } from "@/lib/whop/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Open (or create) a one-on-one DM channel between the signed-in member and
 * another member, and return its channel id. Whop DMs are company-wide — any
 * member can message any other member — so this isn't gated by connections.
 *
 * `dmChannels.create` returns the existing channel if one already exists, so
 * this is idempotent: clicking "Message" repeatedly always lands in the same
 * conversation.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { userId?: string };
  try {
    body = (await request.json()) as { userId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const userId = (body.userId ?? "").trim();
  if (!userId || userId === session.userId) {
    return NextResponse.json({ error: "Invalid member." }, { status: 422 });
  }

  try {
    const channel = await whopsdk.dmChannels.create({
      with_user_ids: [session.userId, userId],
      company_id: whop.companyId,
    });
    return NextResponse.json({ channelId: channel.id });
  } catch (err) {
    console.error("[dms] open channel failed", err);
    return NextResponse.json(
      { error: "Couldn't open the conversation." },
      { status: 502 },
    );
  }
}
