import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { toggleLike, isDbConfigured, ForumUnavailable } from "@/lib/forum/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Toggle the signed-in member's like on a post. Returns the new state + count. */
export async function POST(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Not available yet." }, { status: 503 });
  }

  const { id } = await ctx.params;
  try {
    const result = await toggleLike(id, session.userId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ForumUnavailable) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[forum] POST /like failed", err);
    return NextResponse.json({ error: "Couldn't update your like." }, { status: 500 });
  }
}
