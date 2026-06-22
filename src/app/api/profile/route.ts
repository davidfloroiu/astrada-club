import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/whop/session";
import { getProfile, upsertProfile } from "@/lib/profile/store";
import {
  EMPTY_PROFILE,
  INDUSTRIES,
  STAGES,
  LOOKING_FOR,
  type MemberProfile,
} from "@/lib/profile/fields";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The signed-in member's own profile. */
export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ profile: await getProfile(session.userId) });
}

function clean(v: unknown, max = 120): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function PUT(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Partial<MemberProfile>;
  try {
    body = (await request.json()) as Partial<MemberProfile>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const industry = clean(body.industry);
  const stage = clean(body.stage);
  const lookingFor = Array.isArray(body.lookingFor)
    ? body.lookingFor.filter(
        (x): x is string =>
          typeof x === "string" && (LOOKING_FOR as readonly string[]).includes(x),
      )
    : [];

  const profile: MemberProfile = {
    ...EMPTY_PROFILE,
    industry: (INDUSTRIES as readonly string[]).includes(industry) ? industry : "",
    country: clean(body.country, 80),
    city: clean(body.city, 80),
    role: clean(body.role, 80),
    company: clean(body.company, 80),
    stage: (STAGES as readonly string[]).includes(stage) ? stage : "",
    building: clean(body.building, 280),
    lookingFor,
    seeking: clean(body.seeking, 200),
    linkedin: clean(body.linkedin, 200),
    website: clean(body.website, 200),
  };

  try {
    await upsertProfile(session.userId, profile);
    return NextResponse.json({ profile });
  } catch (err) {
    console.error("[profile] PUT failed", err);
    return NextResponse.json(
      { error: "Couldn't save your profile. Please try again." },
      { status: 500 },
    );
  }
}
