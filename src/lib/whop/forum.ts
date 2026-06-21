import "server-only";
import { whopsdk } from "./sdk";
import { whop } from "./config";

/**
 * Community forum, backed by the Whop "Discussions" forum experience
 * (whop.experiences.forums) where who_can_post / who_can_comment = everyone.
 *
 * Reads use the company API key (`forum:read`). Writes are attributed to the
 * signed-in member: we mint a short-lived user access token scoped to
 * `forum:post:create`, then make the create call as that user via
 * `whopsdk.withOptions({ apiKey: "Bearer <token>" })`. Whop's SDK accepts a user
 * token in place of the API key, so the post shows the member as the author.
 *
 * Comments are just forum posts with a `parent_id` (Whop's model). Likes are
 * read-only — Whop's public API exposes `like_count` but no like/react mutation.
 */

const EXPERIENCE_ID = whop.experiences.forums;

/** The shape we surface to the UI — a trimmed, stable view of a Whop forum post. */
export interface ForumPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  commentCount: number;
  likeCount: number;
  isPinned: boolean;
  isPosterAdmin: boolean;
}

/** A reply on a post. Same Whop entity as a post, minus the title. */
export interface ForumComment {
  id: string;
  content: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  isPosterAdmin: boolean;
}

/** Thrown when a write can't be attributed to the member (missing scope, etc.). */
export class ForumWriteError extends Error {}

// Whop forum_post as returned by the API (only the fields we read).
interface RawForumPost {
  id: string;
  title?: string | null;
  content?: string | null;
  created_at: string;
  comment_count?: number | null;
  like_count?: number | null;
  parent_id?: string | null;
  is_pinned?: boolean | null;
  is_poster_admin?: boolean | null;
  user?: { id: string; name?: string | null; username: string } | null;
}

function isConfigured(): boolean {
  return Boolean(process.env.WHOP_API_KEY && EXPERIENCE_ID);
}

function toPost(raw: RawForumPost): ForumPost {
  return {
    id: raw.id,
    title: (raw.title ?? "").trim(),
    content: raw.content ?? "",
    createdAt: raw.created_at,
    authorName: raw.user?.name ?? raw.user?.username ?? "Member",
    authorUsername: raw.user?.username ?? "",
    commentCount: raw.comment_count ?? 0,
    likeCount: raw.like_count ?? 0,
    isPinned: Boolean(raw.is_pinned),
    isPosterAdmin: Boolean(raw.is_poster_admin),
  };
}

function toComment(raw: RawForumPost): ForumComment {
  return {
    id: raw.id,
    content: raw.content ?? "",
    createdAt: raw.created_at,
    authorName: raw.user?.name ?? raw.user?.username ?? "Member",
    authorUsername: raw.user?.username ?? "",
    isPosterAdmin: Boolean(raw.is_poster_admin),
  };
}

/**
 * Top-level posts, newest first (pinned first). Returns [] when the forum isn't
 * configured or the API errors, so the page always renders.
 */
export async function listPosts(limit = 30): Promise<ForumPost[]> {
  if (!isConfigured()) return [];
  try {
    const page = await whopsdk.forumPosts.list({
      experience_id: EXPERIENCE_ID,
      first: limit,
    });
    const raw = ((page.data ?? []) as RawForumPost[])
      // Defensive: only top-level posts (a comment has a parent_id).
      .filter((p) => !p.parent_id)
      .map(toPost);
    // Pinned first, then newest.
    return raw.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  } catch (err) {
    console.error("[forum] listPosts failed", err);
    return [];
  }
}

/** A single post by id, or null if missing / not configured. */
export async function getPost(id: string): Promise<ForumPost | null> {
  if (!isConfigured()) return null;
  try {
    const raw = (await whopsdk.forumPosts.retrieve(id)) as RawForumPost;
    return toPost(raw);
  } catch (err) {
    console.error("[forum] getPost failed", err);
    return null;
  }
}

/** Replies on a post, oldest first (conversation order). */
export async function listComments(postId: string): Promise<ForumComment[]> {
  if (!isConfigured()) return [];
  try {
    const page = await whopsdk.forumPosts.list({
      experience_id: EXPERIENCE_ID,
      parent_id: postId,
      first: 100,
    });
    return ((page.data ?? []) as RawForumPost[])
      .map(toComment)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch (err) {
    console.error("[forum] listComments failed", err);
    return [];
  }
}

/**
 * A Whop SDK client authenticated as `userId` via a short-lived access token.
 * The token must be a subset of the API key's permissions, so the key needs
 * `forum:post:create` granted — otherwise this throws ForumWriteError.
 */
async function asUser(userId: string, scopedActions: string[]) {
  let token: string;
  try {
    const res = await whopsdk.accessTokens.create({
      company_id: whop.companyId,
      user_id: userId,
      scoped_actions: scopedActions,
    });
    token = res.token;
  } catch (err) {
    console.error("[forum] minting user token failed", err);
    throw new ForumWriteError(
      "Couldn't authorize your post. The forum permission may not be enabled yet.",
    );
  }
  return whopsdk.withOptions({ apiKey: `Bearer ${token}` });
}

/** Create a top-level post as the member. */
export async function createPost(input: {
  userId: string;
  title: string;
  content: string;
}): Promise<ForumPost> {
  const client = await asUser(input.userId, ["forum:post:create"]);
  try {
    const raw = (await client.forumPosts.create({
      experience_id: EXPERIENCE_ID,
      title: input.title,
      content: input.content,
    })) as RawForumPost;
    return toPost(raw);
  } catch (err) {
    console.error("[forum] createPost failed", err);
    throw new ForumWriteError("Couldn't publish your post. Please try again.");
  }
}

/** Create a reply (comment) on `postId` as the member. */
export async function createComment(input: {
  userId: string;
  postId: string;
  content: string;
}): Promise<ForumComment> {
  const client = await asUser(input.userId, ["forum:post:create"]);
  try {
    const raw = (await client.forumPosts.create({
      experience_id: EXPERIENCE_ID,
      parent_id: input.postId,
      content: input.content,
    })) as RawForumPost;
    return toComment(raw);
  } catch (err) {
    console.error("[forum] createComment failed", err);
    throw new ForumWriteError("Couldn't post your reply. Please try again.");
  }
}
