import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { whopsdk } from "@/lib/whop/sdk";
import { whop } from "@/lib/whop/config";

export const dynamic = "force-dynamic";

/**
 * Mint a short-lived access token for the Whop embedded DMs (inbox + thread),
 * scoped to the signed-in member. Separate from the chat-room token so a missing
 * `dms:read` permission degrades only Messages, never the live chat.
 *
 * Requires the WHOP_API_KEY to have `dms:read` (plus chat actions) granted —
 * scoped actions must be a subset of the key's permissions.
 */
export async function POST() {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { token } = await whopsdk.accessTokens.create({
      company_id: whop.companyId,
      user_id: session.userId,
      scoped_actions: ["chat:read", "chat:message:create", "dms:read"],
    });
    return NextResponse.json({ token });
  } catch (err) {
    console.error("[whop] dms token creation failed", err);
    return NextResponse.json({ error: "token_failed" }, { status: 500 });
  }
}
