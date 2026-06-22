import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@vercel/postgres";
import type { StoredNotification } from "./types";

/**
 * Persistent activity notifications (Vercel Postgres) — currently @-mentions
 * from the forum and the Whop chat. These show up in the /notifications inbox
 * alongside the derived connection + intro requests, and feed the header bell's
 * unread count. Best-effort: failures are logged, never thrown, so a
 * notification can't break the action that created it.
 */

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

const ISO = `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`;

let ready = false;
async function ensureTable(): Promise<void> {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      type       TEXT NOT NULL,
      actor_id   TEXT NOT NULL DEFAULT '',
      actor_name TEXT NOT NULL DEFAULT '',
      title      TEXT NOT NULL,
      body       TEXT NOT NULL DEFAULT '',
      url        TEXT NOT NULL DEFAULT '',
      read_at    TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC)`;
  ready = true;
}

export interface NewNotification {
  userId: string;
  type: string;
  actorId?: string;
  actorName?: string;
  title: string;
  body?: string;
  url?: string;
}

export async function createNotifications(items: NewNotification[]): Promise<void> {
  if (!isDbConfigured() || items.length === 0) return;
  try {
    await ensureTable();
    for (const it of items) {
      const id = `ntf_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
      await sql`
        INSERT INTO notifications (id, user_id, type, actor_id, actor_name, title, body, url)
        VALUES (${id}, ${it.userId}, ${it.type}, ${it.actorId ?? ""}, ${it.actorName ?? ""},
                ${it.title}, ${it.body ?? ""}, ${it.url ?? ""})
      `;
    }
  } catch (err) {
    console.error("[notifications] createNotifications failed", err);
  }
}

export async function listNotifications(
  userId: string,
  limit = 40,
): Promise<StoredNotification[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT id, type, actor_id, actor_name, title, body, url, read_at,
              to_char(created_at AT TIME ZONE 'UTC', ${ISO}) AS created_at
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit],
    );
    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      actorId: r.actor_id,
      actorName: r.actor_name,
      title: r.title,
      body: r.body,
      url: r.url,
      read: Boolean(r.read_at),
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("[notifications] listNotifications failed", err);
    return [];
  }
}

export async function unreadCount(userId: string): Promise<number> {
  if (!isDbConfigured()) return 0;
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT count(*)::int AS c FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId],
    );
    return Number(rows[0]?.c) || 0;
  } catch (err) {
    console.error("[notifications] unreadCount failed", err);
    return 0;
  }
}

export async function markAllRead(userId: string): Promise<void> {
  if (!isDbConfigured()) return;
  try {
    await ensureTable();
    await sql.query(
      `UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL`,
      [userId],
    );
  } catch (err) {
    console.error("[notifications] markAllRead failed", err);
  }
}
