import { NextResponse } from "next/server";
import { getSession } from "@/lib/whop/session";
import { pushToUsers, isPushConfigured } from "@/lib/push/send";
import { isNativePushConfigured } from "@/lib/push/native-send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Send the signed-in member a test notification (to confirm push works). */
export async function POST(): Promise<Response> {
  const session = await getSession();
  if (!session.userId || !session.hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPushConfigured() && !isNativePushConfigured()) {
    return NextResponse.json({ error: "Notifications aren't set up." }, { status: 503 });
  }

  await pushToUsers([session.userId], {
    title: "Astrada",
    body: "Notifications are on — you're all set. 🔔",
    url: "/dashboard",
    tag: "astrada-test",
  });
  return NextResponse.json({ ok: true });
}
