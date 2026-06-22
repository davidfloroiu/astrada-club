import { type NextRequest, NextResponse, after } from "next/server";
import { getSession } from "@/lib/whop/session";
import {
  listComments,
  createComment,
  isDbConfigured,
  ForumUnavailable,
  type Author,
} from "@/lib/forum/store";
import { notifyForumMentions } from "@/lib/notifications/mentions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_MAX = 5000;

function authorFromSession(s: {
  userId?: string;
  name?: string;
  username?: string;
  accessLevel?: string;
}): Author {
  return {
    id: s.userId!,
    name: s.name ?? "Member",
    username: s.username,
    isAdmin: s.accessLevel === "admin",
  };
}

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const comments = await listComments(id);
  return NextResponse.json({ comments });
}

interface CreatePayload {
  content?: string;
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;

  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Replies aren't available yet — the database is still being set up." },
      { status: 503 },
    );
  }

  let body: CreatePayload;
  try {
    body = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const content = (body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "Write a reply first." }, { status: 422 });
  }
  if (content.length > CONTENT_MAX) {
    return NextResponse.json({ error: "That reply is too long." }, { status: 422 });
  }

  try {
    const comment = await createComment({
      author: authorFromSession(session),
      postId: id,
      content,
    });
    const authorName = session.name ?? "A member";
    after(() =>
      notifyForumMentions({
        text: content,
        actorId: session.userId!,
        actorName: authorName,
        url: `/forum/${id}`,
        where: "a reply",
      }),
    );
    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumUnavailable) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[forum] POST /comments failed", err);
    return NextResponse.json(
      { error: "Couldn't post your reply. Please try again." },
      { status: 500 },
    );
  }
}
