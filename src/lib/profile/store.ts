import "server-only";
import { sql } from "@vercel/postgres";
import { type MemberProfile, EMPTY_PROFILE } from "./fields";

/**
 * Member profile persistence (Vercel Postgres) — industry, location, company,
 * what they're building, what they're looking for, who they want to meet. Powers
 * the directory + networking. Degrades gracefully when POSTGRES_URL is unset
 * (reads return an empty profile; writes throw). `looking_for` is stored as a
 * `|`-joined string to avoid array-param friction.
 */

export function isDbConfigured(): boolean {
  return Boolean(process.env.POSTGRES_URL);
}

let ready = false;
async function ensureTable(): Promise<void> {
  if (ready) return;
  await sql`
    CREATE TABLE IF NOT EXISTS member_profiles (
      user_id     TEXT PRIMARY KEY,
      industry    TEXT NOT NULL DEFAULT '',
      country     TEXT NOT NULL DEFAULT '',
      city        TEXT NOT NULL DEFAULT '',
      role        TEXT NOT NULL DEFAULT '',
      company     TEXT NOT NULL DEFAULT '',
      stage       TEXT NOT NULL DEFAULT '',
      building    TEXT NOT NULL DEFAULT '',
      looking_for TEXT NOT NULL DEFAULT '',
      seeking     TEXT NOT NULL DEFAULT '',
      linkedin    TEXT NOT NULL DEFAULT '',
      website     TEXT NOT NULL DEFAULT '',
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  ready = true;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toProfile(r: any): MemberProfile {
  return {
    industry: r.industry ?? "",
    country: r.country ?? "",
    city: r.city ?? "",
    role: r.role ?? "",
    company: r.company ?? "",
    stage: r.stage ?? "",
    building: r.building ?? "",
    lookingFor: r.looking_for ? String(r.looking_for).split("|").filter(Boolean) : [],
    seeking: r.seeking ?? "",
    linkedin: r.linkedin ?? "",
    website: r.website ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getProfile(userId: string): Promise<MemberProfile> {
  if (!isDbConfigured()) return { ...EMPTY_PROFILE };
  try {
    await ensureTable();
    const { rows } = await sql`SELECT * FROM member_profiles WHERE user_id = ${userId}`;
    return rows[0] ? toProfile(rows[0]) : { ...EMPTY_PROFILE };
  } catch (err) {
    console.error("[profile] getProfile failed", err);
    return { ...EMPTY_PROFILE };
  }
}

/** Bulk lookup for the directory; missing members simply aren't in the map. */
export async function getProfiles(
  userIds: string[],
): Promise<Map<string, MemberProfile>> {
  const map = new Map<string, MemberProfile>();
  if (!isDbConfigured() || userIds.length === 0) return map;
  try {
    await ensureTable();
    const { rows } = await sql.query(
      `SELECT * FROM member_profiles WHERE user_id = ANY($1)`,
      [userIds],
    );
    for (const r of rows) map.set(r.user_id, toProfile(r));
    return map;
  } catch (err) {
    console.error("[profile] getProfiles failed", err);
    return map;
  }
}

export async function upsertProfile(
  userId: string,
  p: MemberProfile,
): Promise<void> {
  if (!isDbConfigured()) throw new Error("Database not configured");
  await ensureTable();
  const lookingFor = (p.lookingFor ?? []).join("|");
  await sql`
    INSERT INTO member_profiles
      (user_id, industry, country, city, role, company, stage, building,
       looking_for, seeking, linkedin, website, updated_at)
    VALUES
      (${userId}, ${p.industry}, ${p.country}, ${p.city}, ${p.role}, ${p.company},
       ${p.stage}, ${p.building}, ${lookingFor}, ${p.seeking}, ${p.linkedin},
       ${p.website}, now())
    ON CONFLICT (user_id) DO UPDATE SET
      industry = EXCLUDED.industry, country = EXCLUDED.country, city = EXCLUDED.city,
      role = EXCLUDED.role, company = EXCLUDED.company, stage = EXCLUDED.stage,
      building = EXCLUDED.building, looking_for = EXCLUDED.looking_for,
      seeking = EXCLUDED.seeking, linkedin = EXCLUDED.linkedin,
      website = EXCLUDED.website, updated_at = now()
  `;
}
