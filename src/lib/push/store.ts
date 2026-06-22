import "server-only";
import { sql } from "@vercel/postgres";

/**
 * Web-push subscription storage (Vercel Postgres). One row per browser/device
 * subscription, keyed by its unique endpoint. A member can have several (phone,
 * laptop, …). Shares the same database as the forum/events/network.
 */

export interface PushSubscriptionRecord {
  userId: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

let tableReady = false;
async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint   TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      p256dh     TEXT NOT NULL,
      auth       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions(user_id)`;
  tableReady = true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRecord(r: any): PushSubscriptionRecord {
  return {
    userId: r.user_id,
    endpoint: r.endpoint,
    keys: { p256dh: r.p256dh, auth: r.auth },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Upsert a subscription. Re-subscribing on the same endpoint updates the owner/keys. */
export async function saveSubscription(sub: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  await sql.query(
    `INSERT INTO push_subscriptions (endpoint, user_id, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint)
     DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`,
    [sub.endpoint, sub.userId, sub.p256dh, sub.auth],
  );
}

/**
 * Remove a dead subscription by endpoint — internal use only (the push service
 * reported 404/410). Not exposed to the client: the DELETE route uses the
 * owner-scoped variant below so a member can only remove their own.
 */
export async function removeSubscription(endpoint: string): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  await sql.query(`DELETE FROM push_subscriptions WHERE endpoint = $1`, [endpoint]);
}

/** Remove a subscription only if it belongs to `userId` (prevents cross-user deletes). */
export async function removeSubscriptionForUser(
  endpoint: string,
  userId: string,
): Promise<void> {
  if (!isDbConfigured()) return;
  await ensureTable();
  await sql.query(
    `DELETE FROM push_subscriptions WHERE endpoint = $1 AND user_id = $2`,
    [endpoint, userId],
  );
}

/** Bulk-remove dead endpoints in one statement (used when pruning a broadcast). */
export async function removeEndpoints(endpoints: string[]): Promise<void> {
  if (!isDbConfigured() || endpoints.length === 0) return;
  await ensureTable();
  await sql.query(`DELETE FROM push_subscriptions WHERE endpoint = ANY($1)`, [endpoints]);
}

/** Whether a user has at least one active subscription. */
export async function hasSubscription(userId: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT 1 FROM push_subscriptions WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return rows.length > 0;
  } catch (err) {
    console.error("[push] hasSubscription failed", err);
    return false;
  }
}

/** All subscriptions for the given users. */
export async function listForUsers(
  userIds: string[],
): Promise<PushSubscriptionRecord[]> {
  if (!isDbConfigured() || userIds.length === 0) return [];
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT endpoint, user_id, p256dh, auth FROM push_subscriptions
       WHERE user_id = ANY($1)`,
      [userIds],
    );
    return rows.map(toRecord);
  } catch (err) {
    console.error("[push] listForUsers failed", err);
    return [];
  }
}

/** Every subscription except the given user's (for broadcasts that skip the actor). */
export async function listAllExcept(
  userId: string,
): Promise<PushSubscriptionRecord[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT endpoint, user_id, p256dh, auth FROM push_subscriptions
       WHERE user_id <> $1`,
      [userId],
    );
    return rows.map(toRecord);
  } catch (err) {
    console.error("[push] listAllExcept failed", err);
    return [];
  }
}
