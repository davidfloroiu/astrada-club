import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { listPosts, createPost, ForumWriteError } from "@/lib/whop/forum";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TITLE_MAX = 140;
const CONTENT_MAX = 5000;

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await listPosts();
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

  let body: CreatePayload;
  try {
    body = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Add a title and a message." },
      { status: 422 },
    );
  }
  if (title.length > TITLE_MAX || content.length > CONTENT_MAX) {
    return NextResponse.json({ error: "That's a bit too long." }, { status: 422 });
  }

  try {
    const post = await createPost({ userId: session.userId, title, content });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    if (err instanceof ForumWriteError) {
      return NextResponse.json({ error: err.message }, { status: 502 });
    }
    console.error("[forum] POST /posts failed", err);
    return NextResponse.json(
      { error: "Couldn't publish your post. Please try again." },
      { status: 500 },
    );
  }
}
