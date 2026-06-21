import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { whopsdk } from "@/lib/whop/sdk";
import { whop } from "@/lib/whop/config";

export const dynamic = "force-dynamic";

/**
 * Mint a short-lived access token for the Whop embedded chat, scoped to the
 * signed-in member. The browser calls this; the API key never leaves the server.
 * See docs.whop.com/developer/guides/chat/quickstart.
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
      scoped_actions: ["chat:read", "chat:message:create"],
    });
    return NextResponse.json({ token });
  } catch (err) {
    console.error("[whop] chat token creation failed", err);
    return NextResponse.json({ error: "token_failed" }, { status: 500 });
  }
}
