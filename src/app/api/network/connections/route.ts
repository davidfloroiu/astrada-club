import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { memberMap, type DirectoryMember } from "@/lib/members/directory";
import {
  getConnectedIds,
  listIncoming,
  sendRequest,
  respond,
  removeConnection,
  isDbConfigured,
  NetworkUnavailable,
} from "@/lib/network/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [connectedIds, incomingIds, map] = await Promise.all([
    getConnectedIds(session.userId),
    listIncoming(session.userId),
    memberMap(),
  ]);

  const enrich = (id: string): DirectoryMember =>
    map.get(id) ?? { userId: id, name: "Member", username: "", isAdmin: false };

  return NextResponse.json({
    connections: connectedIds.map(enrich),
    incoming: incomingIds.map(enrich),
  });
}

interface ActionPayload {
  action?: "request" | "accept" | "decline" | "remove";
  userId?: string;
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

  let body: ActionPayload;
  try {
    body = (await request.json()) as ActionPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const userId = (body.userId ?? "").trim();
  if (!userId || userId === session.userId) {
    return NextResponse.json({ error: "Invalid member." }, { status: 422 });
  }

  try {
    let status;
    switch (body.action) {
      case "request":
        status = await sendRequest(session.userId, userId);
        break;
      case "accept":
        status = await respond(session.userId, userId, true);
        break;
      case "decline":
        status = await respond(session.userId, userId, false);
        break;
      case "remove":
        status = await removeConnection(session.userId, userId);
        break;
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
    return NextResponse.json({ status });
  } catch (err) {
    if (err instanceof NetworkUnavailable) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[network] connections POST failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
