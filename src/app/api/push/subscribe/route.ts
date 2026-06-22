import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import {
  saveSubscription,
  removeSubscriptionForUser,
  isDbConfigured,
} from "@/lib/push/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SubBody {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  endpoint?: string;
}

/** Store the member's push subscription. */
export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Not available yet." }, { status: 503 });
  }

  let body: SubBody;
  try {
    body = (await request.json()) as SubBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const sub = body.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid subscription." }, { status: 422 });
  }

  try {
    await saveSubscription({ userId: session.userId, endpoint, p256dh, auth });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[push] subscribe failed", err);
    return NextResponse.json({ error: "Couldn't enable notifications." }, { status: 500 });
  }
}

/** Remove the member's subscription on unsubscribe. */
export async function DELETE(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SubBody;
  try {
    body = (await request.json()) as SubBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const endpoint = body.endpoint ?? body.subscription?.endpoint;
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint." }, { status: 422 });
  }

  try {
    await removeSubscriptionForUser(endpoint, session.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[push] unsubscribe failed", err);
    return NextResponse.json({ error: "Couldn't update notifications." }, { status: 500 });
  }
}
