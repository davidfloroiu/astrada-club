import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@vercel/postgres";

/**
 * In-house community forum, stored in our own Vercel Postgres — no Whop
 * dependency. Posts are attributed to the signed-in member from their session
 * (id, name, username, admin flag), so there's no member-token problem.
 *
 * Until the database is connected (POSTGRES_URL unset) this degrades
 * gracefully: reads return [] / null, writes throw ForumUnavailable. Shares the
 * same database as events — one Postgres powers both.
 *
 * Model: a comment is a row with a `parent_id` pointing at its post. Likes live
 * in a join table so each member likes a post at most once.
 */

/** Thrown when the forum can't be written to (e.g. the DB isn't connected yet). */
export class ForumUnavailable extends Error {}

export interface Author {
  id: string;
  name: string;
  username?: string;
  isAdmin: boolean;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  isPosterAdmin: boolean;
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
  isPinned: boolean;
}

export interface ForumComment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  isPosterAdmin: boolean;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

const ISO = `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`;

let tablesReady = false;
async function ensureTables(): Promise<void> {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS forum_posts (
      id              TEXT PRIMARY KEY,
      parent_id       TEXT REFERENCES forum_posts(id) ON DELETE CASCADE,
      author_id       TEXT NOT NULL,
      author_name     TEXT NOT NULL,
      author_username TEXT NOT NULL DEFAULT '',
      author_is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      title           TEXT NOT NULL DEFAULT '',
      content         TEXT NOT NULL,
      is_pinned       BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS forum_likes (
      post_id    TEXT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (post_id, user_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS forum_posts_parent_idx ON forum_posts(parent_id)`;
  tablesReady = true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toPost(r: any): ForumPost {
  return {
    id: r.id,
    title: r.title ?? "",
    content: r.content ?? "",
    createdAt: r.created_at,
    authorId: r.author_id,
    authorName: r.author_name,
    authorUsername: r.author_username ?? "",
    isPosterAdmin: Boolean(r.author_is_admin),
    commentCount: Number(r.comment_count) || 0,
    likeCount: Number(r.like_count) || 0,
    likedByMe: Boolean(r.liked_by_me),
    isPinned: Boolean(r.is_pinned),
  };
}

function toComment(r: any): ForumComment {
  return {
    id: r.id,
    content: r.content ?? "",
    createdAt: r.created_at,
    authorId: r.author_id,
    authorName: r.author_name,
    authorUsername: r.author_username ?? "",
    isPosterAdmin: Boolean(r.author_is_admin),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Top-level posts, pinned first then newest. `viewerId` flags the viewer's likes. */
export async function listPosts(viewerId: string, limit = 50): Promise<ForumPost[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTables();
    const { rows } = await sql.query(
      `SELECT p.id, p.title, p.content, p.author_id, p.author_name,
              p.author_username, p.author_is_admin, p.is_pinned,
              to_char(p.created_at AT TIME ZONE 'UTC', ${ISO}) AS created_at,
              (SELECT count(*) FROM forum_posts c WHERE c.parent_id = p.id) AS comment_count,
              (SELECT count(*) FROM forum_likes l WHERE l.post_id = p.id) AS like_count,
              EXISTS(SELECT 1 FROM forum_likes l2 WHERE l2.post_id = p.id AND l2.user_id = $1) AS liked_by_me
       FROM forum_posts p
       WHERE p.parent_id IS NULL
       ORDER BY p.is_pinned DESC, p.created_at DESC
       LIMIT $2`,
      [viewerId, limit],
    );
    return rows.map(toPost);
  } catch (err) {
    console.error("[forum] listPosts failed", err);
    return [];
  }
}

export async function getPost(id: string, viewerId: string): Promise<ForumPost | null> {
  if (!isDbConfigured()) return null;
  try {
    await ensureTables();
    const { rows } = await sql.query(
      `SELECT p.id, p.title, p.content, p.author_id, p.author_name,
              p.author_username, p.author_is_admin, p.is_pinned,
              to_char(p.created_at AT TIME ZONE 'UTC', ${ISO}) AS created_at,
              (SELECT count(*) FROM forum_posts c WHERE c.parent_id = p.id) AS comment_count,
              (SELECT count(*) FROM forum_likes l WHERE l.post_id = p.id) AS like_count,
              EXISTS(SELECT 1 FROM forum_likes l2 WHERE l2.post_id = p.id AND l2.user_id = $1) AS liked_by_me
       FROM forum_posts p
       WHERE p.id = $2 AND p.parent_id IS NULL`,
      [viewerId, id],
    );
    return rows[0] ? toPost(rows[0]) : null;
  } catch (err) {
    console.error("[forum] getPost failed", err);
    return null;
  }
}

/** Replies on a post, oldest first. */
export async function listComments(postId: string): Promise<ForumComment[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTables();
    const { rows } = await sql.query(
      `SELECT id, content, author_id, author_name, author_username, author_is_admin,
              to_char(created_at AT TIME ZONE 'UTC', ${ISO}) AS created_at
       FROM forum_posts
       WHERE parent_id = $1
       ORDER BY created_at ASC
       LIMIT 500`,
      [postId],
    );
    return rows.map(toComment);
  } catch (err) {
    console.error("[forum] listComments failed", err);
    return [];
  }
}

function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

export async function createPost(input: {
  author: Author;
  title: string;
  content: string;
}): Promise<ForumPost> {
  if (!isDbConfigured()) throw new ForumUnavailable("Database not configured");
  await ensureTables();
  const id = newId("post");
  await sql.query(
    `INSERT INTO forum_posts
       (id, parent_id, author_id, author_name, author_username, author_is_admin, title, content)
     VALUES ($1, NULL, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      input.author.id,
      input.author.name,
      input.author.username ?? "",
      input.author.isAdmin,
      input.title,
      input.content,
    ],
  );
  const post = await getPost(id, input.author.id);
  if (!post) throw new ForumUnavailable("Post could not be created");
  return post;
}

export async function createComment(input: {
  author: Author;
  postId: string;
  content: string;
}): Promise<ForumComment> {
  if (!isDbConfigured()) throw new ForumUnavailable("Database not configured");
  await ensureTables();

  // Only allow comments on an existing top-level post.
  const parent = await sql.query(
    `SELECT 1 FROM forum_posts WHERE id = $1 AND parent_id IS NULL`,
    [input.postId],
  );
  if (parent.rows.length === 0) throw new ForumUnavailable("That post no longer exists");

  const id = newId("cmt");
  await sql.query(
    `INSERT INTO forum_posts
       (id, parent_id, author_id, author_name, author_username, author_is_admin, title, content)
     VALUES ($1, $2, $3, $4, $5, $6, '', $7)`,
    [
      id,
      input.postId,
      input.author.id,
      input.author.name,
      input.author.username ?? "",
      input.author.isAdmin,
      input.content,
    ],
  );
  return {
    id,
    content: input.content,
    createdAt: new Date().toISOString(),
    authorId: input.author.id,
    authorName: input.author.name,
    authorUsername: input.author.username ?? "",
    isPosterAdmin: input.author.isAdmin,
  };
}

/** Toggle the viewer's like on a post. Returns the new state + count. */
export async function toggleLike(
  postId: string,
  userId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  if (!isDbConfigured()) throw new ForumUnavailable("Database not configured");
  await ensureTables();

  // Atomic toggle: try to INSERT. If a row was actually inserted, the user just
  // liked it; otherwise they had already liked it, so DELETE (unlike). Deriving
  // `liked` from what the mutation actually did — not a stale pre-read — avoids
  // the check-then-act race where two concurrent toggles disagree with the count.
  const inserted = await sql.query(
    `INSERT INTO forum_likes (post_id, user_id) VALUES ($1, $2)
     ON CONFLICT (post_id, user_id) DO NOTHING
     RETURNING 1`,
    [postId, userId],
  );
  const liked = (inserted.rowCount ?? 0) > 0;
  if (!liked) {
    await sql.query(`DELETE FROM forum_likes WHERE post_id = $1 AND user_id = $2`, [
      postId,
      userId,
    ]);
  }

  const { rows } = await sql.query(
    `SELECT count(*)::int AS c FROM forum_likes WHERE post_id = $1`,
    [postId],
  );
  return { liked, likeCount: Number(rows[0]?.c) || 0 };
}
