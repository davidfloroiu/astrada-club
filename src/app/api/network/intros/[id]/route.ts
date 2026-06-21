import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { resolveIntro, isDbConfigured, NetworkUnavailable } from "@/lib/network/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Payload {
  status?: "done" | "dismissed";
}

/** Resolve an intro request the signed-in member was asked to make. */
export async function POST(
  request: NextRequest,
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
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const status = body.status === "done" ? "done" : "dismissed";
  try {
    await resolveIntro(id, session.userId, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof NetworkUnavailable) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[network] intros resolve failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
