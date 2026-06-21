import { type NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhopWebhookEvent = ReturnType<typeof whopsdk.webhooks.unwrap>;
type MembershipActivated = Extract<
  WhopWebhookEvent,
  { type: "membership.activated" }
>;

/**
 * Whop webhook receiver. Validates the signature via the SDK (standardwebhooks)
 * and handles new members. See docs.whop.com/developer/guides/webhooks.
 *
 * Whop natively grants paying members access to the community experiences
 * (chat, forums, events, announcements), so no provisioning is needed here.
 * We log new members for visibility; hook in CRM / welcome flows downstream.
 *
 * Subscribed event: `membership.activated` (fires when a member's membership
 * becomes active — i.e. they joined). Its payload includes the member's email.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const headers = Object.fromEntries(request.headers);

  let event: WhopWebhookEvent;
  try {
    // Throws if the signature is missing/invalid → reject.
    event = whopsdk.webhooks.unwrap(body, { headers });
  } catch (err) {
    console.error("[whop] webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "membership.activated") {
    handleNewMember(event.data);
  }

  return new Response("OK", { status: 200 });
}

function handleNewMember(membership: MembershipActivated["data"]) {
  // TODO: trigger CRM sync / welcome flow here.
  console.log("[whop] membership.activated — new member", {
    name: membership.user?.name ?? membership.user?.username ?? null,
    email: membership.user?.email ?? null,
    userId: membership.user?.id ?? null,
    memberId: membership.member?.id ?? null,
    planId: membership.plan?.id ?? null,
    productId: membership.product?.id ?? null,
    membershipId: membership.id,
  });
}
