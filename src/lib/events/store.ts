import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "@vercel/postgres";
import type { ClubEvent, EventType } from "@/lib/types";

/**
 * Event persistence (Vercel Postgres). Events are created by admins/moderators
 * and read by all members. Until the database is connected (POSTGRES_URL unset)
 * this degrades gracefully: reads return [], creates throw a clear error.
 */

export const EVENT_TYPES: EventType[] = [
  "dinner",
  "run",
  "summit",
  "workshop",
  "social",
];

export interface NewEvent {
  title: string;
  type: EventType;
  date: string; // yyyy-mm-dd
  time: string;
  city: string;
  venue: string;
  host: string;
  capacity: number;
  description: string;
  createdBy: string; // whop user id
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

let tableReady = false;
async function ensureTable(): Promise<void> {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      type        TEXT NOT NULL,
      event_date  DATE NOT NULL,
      event_time  TEXT NOT NULL,
      city        TEXT NOT NULL,
      venue       TEXT NOT NULL,
      host        TEXT NOT NULL,
      capacity    INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      created_by  TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  tableReady = true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toClubEvent(r: any): ClubEvent {
  const capacity = Number(r.capacity) || 0;
  return {
    id: r.id,
    title: r.title,
    type: r.type as EventType,
    date: r.date,
    time: r.event_time,
    city: r.city,
    venue: r.venue,
    host: r.host,
    capacity,
    spotsLeft: capacity, // RSVPs not tracked yet
    description: r.description,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** All events, soonest first. Returns [] if the DB isn't configured. */
export async function listEvents(): Promise<ClubEvent[]> {
  if (!isDbConfigured()) return [];
  try {
    await ensureTable();
    const { rows } = await sql`
      SELECT id, title, type, to_char(event_date, 'YYYY-MM-DD') AS date,
             event_time, city, venue, host, capacity, description
      FROM events
      ORDER BY event_date ASC, created_at ASC
    `;
    return rows.map(toClubEvent);
  } catch (err) {
    console.error("[events] listEvents failed", err);
    return [];
  }
}

/**
 * "Today" in the club's timezone (YYYY-MM-DD). Using UTC here dropped an event
 * happening tonight once UTC rolled past midnight for members in the Americas.
 * Configurable via CLUB_TIMEZONE; falls back to UTC if the zone is invalid.
 */
function clubToday(): string {
  const tz = process.env.CLUB_TIMEZONE || "America/Los_Angeles";
  try {
    // en-CA renders as YYYY-MM-DD, which matches the stored DATE format.
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** Only events today or later (relative to the club timezone). */
export async function listUpcomingEvents(): Promise<ClubEvent[]> {
  const all = await listEvents();
  const today = clubToday();
  return all.filter((e) => e.date >= today);
}

export async function createEvent(input: NewEvent): Promise<ClubEvent> {
  if (!isDbConfigured()) {
    throw new Error("Database not configured");
  }
  await ensureTable();
  const id = `evt_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  await sql`
    INSERT INTO events
      (id, title, type, event_date, event_time, city, venue, host, capacity, description, created_by)
    VALUES
      (${id}, ${input.title}, ${input.type}, ${input.date}, ${input.time},
       ${input.city}, ${input.venue}, ${input.host}, ${input.capacity},
       ${input.description}, ${input.createdBy})
  `;
  return {
    id,
    title: input.title,
    type: input.type,
    date: input.date,
    time: input.time,
    city: input.city,
    venue: input.venue,
    host: input.host,
    capacity: input.capacity,
    spotsLeft: input.capacity,
    description: input.description,
  };
}
