import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { memberMap, type DirectoryMember } from "@/lib/members/directory";
import {
  listIntros,
  createIntro,
  mutualIds,
  isDbConfigured,
  NetworkUnavailable,
} from "@/lib/network/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Intro requests addressed to the signed-in member (asked to make the intro). */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [intros, map] = await Promise.all([listIntros(session.userId), memberMap()]);
  const enrich = (id: string): DirectoryMember =>
    map.get(id) ?? { userId: id, name: "Member", username: "", isAdmin: false };

  return NextResponse.json({
    intros: intros.map((i) => ({
      id: i.id,
      note: i.note,
      createdAt: i.createdAt,
      from: enrich(i.fromId),
      target: enrich(i.targetId),
    })),
  });
}

interface CreatePayload {
  viaUserId?: string;
  targetUserId?: string;
  note?: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Networking isn't available yet — the database is still being set up." },
      { status: 503 },
    );
  }

  let body: CreatePayload;
  try {
    body = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const viaUserId = (body.viaUserId ?? "").trim();
  const targetUserId = (body.targetUserId ?? "").trim();
  const note = (body.note ?? "").trim();

  if (!viaUserId || !targetUserId) {
    return NextResponse.json({ error: "Pick who you'd like to meet." }, { status: 422 });
  }

  // You can only ask a genuine mutual connection for an intro.
  const mutuals = await mutualIds(session.userId, targetUserId);
  if (!mutuals.includes(viaUserId)) {
    return NextResponse.json(
      { error: "That person isn't a shared connection." },
      { status: 422 },
    );
  }

  try {
    await createIntro({
      fromId: session.userId,
      viaId: viaUserId,
      targetId: targetUserId,
      note,
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof NetworkUnavailable) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[network] intros POST failed", err);
    return NextResponse.json({ error: "Couldn't send your request." }, { status: 500 });
  }
}
