import { type NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import {
  listEvents,
  createEvent,
  isDbConfigured,
  EVENT_TYPES,
  type NewEvent,
} from "@/lib/events/store";
import type { EventType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const events = await listEvents();
  return NextResponse.json({ events });
}

interface CreatePayload {
  title?: string;
  type?: string;
  date?: string;
  time?: string;
  city?: string;
  venue?: string;
  host?: string;
  capacity?: number | string;
  description?: string;
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.accessLevel !== "admin") {
    return NextResponse.json(
      { error: "Only admins and moderators can create events." },
      { status: 403 },
    );
  }
  if (!isDbConfigured()) {
    return NextResponse.json(
      { error: "Events storage isn't connected yet. Try again shortly." },
      { status: 503 },
    );
  }

  let body: CreatePayload;
  try {
    body = (await request.json()) as CreatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const type = (body.type ?? "").trim();
  const date = (body.date ?? "").trim();
  const time = (body.time ?? "").trim();
  const city = (body.city ?? "").trim();
  const venue = (body.venue ?? "").trim();
  const description = (body.description ?? "").trim();
  const host = (body.host ?? "").trim() || session.name || "Astrada";
  const capacity = Math.max(0, Math.floor(Number(body.capacity) || 0));

  const validType = EVENT_TYPES.includes(type as EventType);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);

  if (!title || !validType || !validDate || !time || !city || !venue) {
    return NextResponse.json(
      {
        error:
          "Please fill in a title, type, valid date, time, city, and venue.",
      },
      { status: 422 },
    );
  }

  const newEvent: NewEvent = {
    title,
    type: type as EventType,
    date,
    time,
    city,
    venue,
    host,
    capacity,
    description,
    createdBy: session.userId,
  };

  try {
    const event = await createEvent(newEvent);
    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error("[events] create failed", err);
    return NextResponse.json(
      { error: "Couldn't create the event. Please try again." },
      { status: 500 },
    );
  }
}
