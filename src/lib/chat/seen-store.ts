import "server-only";
import { sql } from "@vercel/postgres";

/**
 * Per-room "last message we've already notified about" bookmark, in Vercel
 * Postgres. The chat-notify cron polls each shared community room and uses this
 * to fire push only for messages newer than the last run. Shares the database
 * with the forum / events / network stores.
 */

export interface RoomSeen {
  channelId: string;
  lastMessageId: string;
  lastCreatedAt: string;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

let ready = false;
async function ensureTable(): Promise<void> {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS chat_room_seen (
      channel_id      TEXT PRIMARY KEY,
      last_message_id TEXT NOT NULL,
      last_created_at TIMESTAMPTZ NOT NULL,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  ready = true;
}

export async function getSeen(channelId: string): Promise<RoomSeen | null> {
  if (!isDbConfigured()) return null;
  await ensureTable();
  const { rows } = await sql`
    SELECT channel_id, last_message_id,
           to_char(last_created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS last_created_at
    FROM chat_room_seen WHERE channel_id = ${channelId}
  `;
  const r = rows[0];
  return r
    ? { channelId: r.channel_id, lastMessageId: r.last_message_id, lastCreatedAt: r.last_created_at }
    : null;
}

export async function setSeen(
  channelId: string,
  messageId: string,
  createdAt: string,
): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  await sql`
    INSERT INTO chat_room_seen (channel_id, last_message_id, last_created_at, updated_at)
    VALUES (${channelId}, ${messageId}, ${createdAt}, now())
    ON CONFLICT (channel_id)
    DO UPDATE SET last_message_id = EXCLUDED.last_message_id,
                  last_created_at = EXCLUDED.last_created_at,
                  updated_at = now()
  `;
}
