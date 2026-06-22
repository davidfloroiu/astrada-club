import { type NextRequest, NextResponse, after } from "next/server";
import { getSession } from "@/lib/whop/session";
import {
  listPosts,
  createPost,
  isDbConfigured,
  ForumUnavailable,
  type Author,
} from "@/lib/forum/store";
import { pushBroadcast } from "@/lib/push/send";
import { notifyForumMentions } from "@/lib/notifications/mentions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TITLE_MAX = 140;
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

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await listPosts(session.userId);
  return NextResponse.json({ posts });
}

interface CreatePayload {
  title?: string;
  content?: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Posting isn't available yet — the database is still being set up." },
      { status: 503 },
    );
  }

  let body: CreatePayload;
  try {
    body = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();

  if (!title || !content) {
    return NextResponse.json({ error: "Add a title and a message." }, { status: 422 });
  }
  if (title.length > TITLE_MAX || content.length > CONTENT_MAX) {
    return NextResponse.json({ error: "That's a bit too long." }, { status: 422 });
  }

  try {
    const post = await createPost({
      author: authorFromSession(session),
      title,
      content,
    });
    const actor = session.userId;
    const authorName = session.name ?? "A member";
    after(() =>
      pushBroadcast(actor, {
        title: "New post in the forum",
        body: `${authorName}: ${title}`,
        url: `/forum/${post.id}`,
        tag: `forum-${post.id}`,
      }),
    );
    after(() =>
      notifyForumMentions({
        text: content,
        actorId: actor,
        actorName: authorName,
        url: `/forum/${post.id}`,
        where: "a post",
      }),
    );
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumUnavailable) {
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    console.error("[forum] POST /posts failed", err);
    return NextResponse.json(
      { error: "Couldn't publish your post. Please try again." },
      { status: 500 },
    );
  }
}
