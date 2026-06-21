import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/whop/session";

export const dynamic = "force-dynamic";

async function destroy() {
  const session = await getSession();
  session.destroy();
}

/** Client-initiated sign out (fetch). */
export async function POST() {
  await destroy();
  return NextResponse.json({ ok: true });
}

/** Link-based sign out. */
export async function GET(request: NextRequest) {
  await destroy();
  return NextResponse.redirect(new URL("/", request.url));
}
