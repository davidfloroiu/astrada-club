import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@vercel/postgres";

/**
 * The member network — LinkedIn-style connections + warm-intro requests, in our
 * own Vercel Postgres. Connections are between Whop user ids; the API layer
 * enriches them with member identity. Warm intros are in-app: you ask a mutual
 * connection, and it lands in their intro inbox.
 *
 * Degrades gracefully when POSTGRES_URL is unset (reads empty, writes throw
 * NetworkUnavailable). Shares the database with the forum + events.
 */

export class NetworkUnavailable extends Error {}

/** Status of the viewer's relationship to another member. */
export type ConnectionStatus =
  | "none"
  | "outgoing" // viewer requested them, pending
  | "incoming" // they requested viewer, pending
  | "connected";

export interface IntroRequest {
  id: string;
  fromId: string;
  viaId: string;
  targetId: string;
  note: string;
  createdAt: string;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

const ISO = `'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'`;

let tablesReady = false;
async function ensureTables(): Promise<void> {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS connections (
      id           TEXT PRIMARY KEY,
      requester_id TEXT NOT NULL,
      addressee_id TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
      responded_at TIMESTAMPTZ,
      UNIQUE (requester_id, addressee_id)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS connections_addressee_idx ON connections(addressee_id)`;
  await sql`CREATE INDEX IF NOT EXISTS connections_requester_idx ON connections(requester_id)`;
  await sql`
    CREATE TABLE IF NOT EXISTS intro_requests (
      id         TEXT PRIMARY KEY,
      from_id    TEXT NOT NULL,
      via_id     TEXT NOT NULL,
      target_id  TEXT NOT NULL,
      note       TEXT NOT NULL DEFAULT '',
      status     TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS intro_via_idx ON intro_requests(via_id)`;
  tablesReady = true;
}

function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

/** Map each of `otherIds` to the viewer's connection status with them. */
export async function getStatuses(
  viewerId: string,
  otherIds: string[],
): Promise<Map<string, ConnectionStatus>> {
  const result = new Map<string, ConnectionStatus>();
  otherIds.forEach((id) => result.set(id, "none"));
  if (!isDbConfigured() || otherIds.length === 0) return result;
  try {
    await ensureTables();
    const { rows } = await sql.query(
      `SELECT requester_id, addressee_id, status FROM connections
       WHERE (requester_id = $1 AND addressee_id = ANY($2))
          OR (addressee_id = $1 AND requester_id = ANY($2))`,
      [viewerId, otherIds],
    );
    for (const r of rows) {
      const other = r.requester_id === viewerId ? r.addressee_id : r.requester_id;
      if (r.status === "accepted") result.set(other, "connected");
      else if (r.requester_id === viewerId) result.set(other, "outgoing");
      else result.set(other, "incoming");
    }
    return result;
  } catch (err) {
    console.error("[network] getStatuses failed", err);
    return result;
  }
}

export async function getStatus(
  viewerId: string,
  otherId: string,
): Promise<ConnectionStatus> {
  return (await getStatuses(viewerId, [otherId])).get(otherId) ?? "none";
}

/** Ids of everyone the user is connected to (accepted). */
export async function getConnectedIds(userId: string): Promise<string[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTables();
    const { rows } = await sql.query(
      `SELECT requester_id, addressee_id FROM connections
       WHERE status = 'accepted' AND (requester_id = $1 OR addressee_id = $1)`,
      [userId],
    );
    return rows.map((r) => (r.requester_id === userId ? r.addressee_id : r.requester_id));
  } catch (err) {
    console.error("[network] getConnectedIds failed", err);
    return [];
  }
}

/** Ids of people who've sent the user a pending connection request. */
export async function listIncoming(userId: string): Promise<string[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTables();
    const { rows } = await sql.query(
      `SELECT requester_id FROM connections
       WHERE addressee_id = $1 AND status = 'pending'
       ORDER BY created_at DESC`,
      [userId],
    );
    return rows.map((r) => r.requester_id);
  } catch (err) {
    console.error("[network] listIncoming failed", err);
    return [];
  }
}

/** Send (or auto-accept a reciprocal) connection request. Returns new status. */
export async function sendRequest(
  requesterId: string,
  addresseeId: string,
): Promise<ConnectionStatus> {
  if (!isDbConfigured()) throw new NetworkUnavailable("Database not configured");
  if (requesterId === addresseeId) throw new NetworkUnavailable("Can't connect to yourself");
  await ensureTables();

  const existing = await sql.query(
    `SELECT requester_id, addressee_id, status FROM connections
     WHERE (requester_id = $1 AND addressee_id = $2)
        OR (requester_id = $2 AND addressee_id = $1)`,
    [requesterId, addresseeId],
  );
  if (existing.rows.length > 0) {
    const r = existing.rows[0];
    if (r.status === "accepted") return "connected";
    // A pending request the other way → accept it.
    if (r.requester_id === addresseeId) {
      await sql.query(
        `UPDATE connections SET status='accepted', responded_at=now()
         WHERE requester_id=$1 AND addressee_id=$2`,
        [addresseeId, requesterId],
      );
      return "connected";
    }
    return "outgoing";
  }

  await sql.query(
    `INSERT INTO connections (id, requester_id, addressee_id, status)
     VALUES ($1, $2, $3, 'pending')`,
    [newId("con"), requesterId, addresseeId],
  );
  return "outgoing";
}

/** Accept or decline a pending request that `otherId` sent the viewer. */
export async function respond(
  viewerId: string,
  otherId: string,
  accept: boolean,
): Promise<ConnectionStatus> {
  if (!isDbConfigured()) throw new NetworkUnavailable("Database not configured");
  await ensureTables();
  if (accept) {
    await sql.query(
      `UPDATE connections SET status='accepted', responded_at=now()
       WHERE requester_id=$1 AND addressee_id=$2 AND status='pending'`,
      [otherId, viewerId],
    );
    return "connected";
  }
  await sql.query(
    `DELETE FROM connections
     WHERE requester_id=$1 AND addressee_id=$2 AND status='pending'`,
    [otherId, viewerId],
  );
  return "none";
}

/** Remove a connection (or cancel an outgoing request) in either direction. */
export async function removeConnection(
  viewerId: string,
  otherId: string,
): Promise<ConnectionStatus> {
  if (!isDbConfigured()) throw new NetworkUnavailable("Database not configured");
  await ensureTables();
  await sql.query(
    `DELETE FROM connections
     WHERE (requester_id=$1 AND addressee_id=$2)
        OR (requester_id=$2 AND addressee_id=$1)`,
    [viewerId, otherId],
  );
  return "none";
}

/** Members connected to both the viewer and `otherId`. */
export async function mutualIds(viewerId: string, otherId: string): Promise<string[]> {
  const [mine, theirs] = await Promise.all([
    getConnectedIds(viewerId),
    getConnectedIds(otherId),
  ]);
  const set = new Set(theirs);
  return mine.filter((id) => set.has(id) && id !== viewerId && id !== otherId);
}

export async function createIntro(input: {
  fromId: string;
  viaId: string;
  targetId: string;
  note: string;
}): Promise<void> {
  if (!isDbConfigured()) throw new NetworkUnavailable("Database not configured");
  const { fromId, viaId, targetId } = input;
  if (viaId === fromId || viaId === targetId || fromId === targetId) {
    throw new NetworkUnavailable("Invalid intro request");
  }
  await ensureTables();
  await sql.query(
    `INSERT INTO intro_requests (id, from_id, via_id, target_id, note)
     VALUES ($1, $2, $3, $4, $5)`,
    [newId("intro"), fromId, viaId, targetId, input.note.slice(0, 1000)],
  );
}

/** Pending intro requests addressed to `viaId` (the mutual being asked). */
export async function listIntros(viaId: string): Promise<IntroRequest[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTables();
    const { rows } = await sql.query(
      `SELECT id, from_id, via_id, target_id, note,
              to_char(created_at AT TIME ZONE 'UTC', ${ISO}) AS created_at
       FROM intro_requests
       WHERE via_id = $1 AND status = 'pending'
       ORDER BY created_at DESC`,
      [viaId],
    );
    return rows.map((r) => ({
      id: r.id,
      fromId: r.from_id,
      viaId: r.via_id,
      targetId: r.target_id,
      note: r.note ?? "",
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("[network] listIntros failed", err);
    return [];
  }
}

export async function resolveIntro(
  id: string,
  viaId: string,
  status: "done" | "dismissed",
): Promise<void> {
  if (!isDbConfigured()) throw new NetworkUnavailable("Database not configured");
  await ensureTables();
  await sql.query(
    `UPDATE intro_requests SET status=$1 WHERE id=$2 AND via_id=$3`,
    [status, id, viaId],
  );
}

/** Small counts for nav badges / headers. */
export async function pendingCounts(
  userId: string,
): Promise<{ incoming: number; intros: number }> {
  if (!isDbConfigured()) return { incoming: 0, intros: 0 };
  try {
    await ensureTables();
    const [a, b] = await Promise.all([
      sql.query(
        `SELECT count(*)::int AS c FROM connections WHERE addressee_id=$1 AND status='pending'`,
        [userId],
      ),
      sql.query(
        `SELECT count(*)::int AS c FROM intro_requests WHERE via_id=$1 AND status='pending'`,
        [userId],
      ),
    ]);
    return { incoming: Number(a.rows[0]?.c) || 0, intros: Number(b.rows[0]?.c) || 0 };
  } catch (err) {
    console.error("[network] pendingCounts failed", err);
    return { incoming: 0, intros: 0 };
  }
}
