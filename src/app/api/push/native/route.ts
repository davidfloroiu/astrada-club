import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import {
  saveToken,
  removeTokenForUser,
  isDbConfigured,
  type NativePlatform,
} from "@/lib/push/native-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  token?: string;
  platform?: string;
}

function parsePlatform(p: unknown): NativePlatform | null {
  return p === "ios" || p === "android" ? p : null;
}

/** Register the member's native (app) device token for push. */
export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Not available yet." }, { status: 503 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = body.token;
  const platform = parsePlatform(body.platform);
  if (!token || !platform) {
    return NextResponse.json({ error: "Invalid token." }, { status: 422 });
  }

  try {
    await saveToken({ userId: session.userId, token, platform });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[native-push] register failed", err);
    return NextResponse.json({ error: "Couldn't enable notifications." }, { status: 500 });
  }
}

/** Remove the member's device token (sign-out / unregister). */
export async function DELETE(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.token) {
    return NextResponse.json({ error: "Missing token." }, { status: 422 });
  }

  try {
    await removeTokenForUser(body.token, session.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[native-push] unregister failed", err);
    return NextResponse.json({ error: "Couldn't update notifications." }, { status: 500 });
  }
}
