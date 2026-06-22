import "server-only";
import { whopsdk } from "@/lib/whop/sdk";
import { whop } from "@/lib/whop/config";

/**
 * The real member directory, sourced from Whop company members (company API
 * key). These are the people in the club — used for the directory and the
 * networking features. Whop gives us identity (name, username); richer profile
 * fields can come later.
 */

export interface DirectoryMember {
  userId: string;
  name: string;
  username: string;
  isAdmin: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toMember(raw: any): DirectoryMember | null {
  const user = raw?.user;
  if (!user?.id) return null;
  return {
    userId: user.id,
    name: user.name ?? user.username ?? "Member",
    username: user.username ?? "",
    isAdmin: raw.access_level === "admin",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Everyone who has joined the club, deduped by user. Returns [] on error so the
 * directory always renders.
 */
export async function listMembers(): Promise<DirectoryMember[]> {
  try {
    const page = await whopsdk.members.list({
      company_id: whop.companyId,
      first: 200,
    });
    const seen = new Set<string>();
    const out: DirectoryMember[] = [];
    for (const raw of page.data ?? []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = raw as any;
      if (r.status && r.status !== "joined") continue;
      if (r.access_level === "no_access") continue;
      const m = toMember(r);
      if (m && !seen.has(m.userId)) {
        seen.add(m.userId);
        out.push(m);
      }
    }
    out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  } catch (err) {
    console.error("[members] listMembers failed", err);
    return [];
  }
}

/** A lookup map keyed by userId, for enriching connection/intro records. */
export async function memberMap(): Promise<Map<string, DirectoryMember>> {
  const members = await listMembers();
  return new Map(members.map((m) => [m.userId, m]));
}

/** A lookup map keyed by lower-cased username, for resolving @mentions. */
export async function usernameMap(): Promise<Map<string, DirectoryMember>> {
  const members = await listMembers();
  const map = new Map<string, DirectoryMember>();
  for (const m of members) {
    if (m.username) map.set(m.username.toLowerCase(), m);
  }
  return map;
}

export async function getMember(userId: string): Promise<DirectoryMember | null> {
  const map = await memberMap();
  return map.get(userId) ?? null;
}
