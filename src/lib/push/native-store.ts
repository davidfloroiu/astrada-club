import "server-only";
import { sql } from "@vercel/postgres";

/**
 * Native (app) push token storage — the counterpart to the web-push
 * `push_subscriptions` table. One row per device install, keyed by its FCM/APNs
 * token. iOS tokens are delivered via APNs, Android tokens via FCM (the
 * `platform` column routes them). Shares the same Postgres database.
 */

export type NativePlatform = "ios" | "android";

export interface NativeTokenRecord {
  userId: string;
  token: string;
  platform: NativePlatform;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

let tableReady = false;
async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS native_push_tokens (
      token      TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      platform   TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS native_push_tokens_user_idx ON native_push_tokens(user_id)`;
  tableReady = true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRecord(r: any): NativeTokenRecord {
  return { userId: r.user_id, token: r.token, platform: r.platform };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Upsert a device token. Re-registering the same token updates owner/platform. */
export async function saveToken(t: {
  userId: string;
  token: string;
  platform: NativePlatform;
}): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  await sql.query(
    `INSERT INTO native_push_tokens (token, user_id, platform)
     VALUES ($1, $2, $3)
     ON CONFLICT (token)
     DO UPDATE SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform`,
    [t.token, t.userId, t.platform],
  );
}

/** Remove a token only if it belongs to `userId` (used by the DELETE route). */
export async function removeTokenForUser(
  token: string,
  userId: string,
): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  await sql.query(
    `DELETE FROM native_push_tokens WHERE token = $1 AND user_id = $2`,
    [token, userId],
  );
}

/** Bulk-remove dead tokens in one statement (used when pruning after a send). */
export async function removeTokens(tokens: string[]): Promise<void> {
  if (!isDbConfigured() || tokens.length === 0) return;
  await ensureTable();
  await sql.query(`DELETE FROM native_push_tokens WHERE token = ANY($1)`, [tokens]);
}

/** All device tokens for the given users. */
export async function listForUsers(
  userIds: string[],
): Promise<NativeTokenRecord[]> {
  if (!isDbConfigured() || userIds.length === 0) return [];
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT token, user_id, platform FROM native_push_tokens WHERE user_id = ANY($1)`,
      [userIds],
    );
    return rows.map(toRecord);
  } catch (err) {
    console.error("[native-push] listForUsers failed", err);
    return [];
  }
}

/** Every device token except the given user's (for broadcasts that skip the actor). */
export async function listAllExcept(
  userId: string,
): Promise<NativeTokenRecord[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT token, user_id, platform FROM native_push_tokens WHERE user_id <> $1`,
      [userId],
    );
    return rows.map(toRecord);
  } catch (err) {
    console.error("[native-push] listAllExcept failed", err);
    return [];
  }
}
