import { type NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WhopWebhookEvent = ReturnType<typeof whopsdk.webhooks.unwrap>;
type PaymentSucceeded = Extract<WhopWebhookEvent, { type: "payment.succeeded" }>;

/**
 * Whop webhook receiver. Validates the signature via the SDK (standardwebhooks)
 * and handles successful payments. See docs.whop.com/developer/guides/webhooks.
 *
 * Whop natively grants paying members access to the community experiences
 * (chat, forums, events, announcements), so no provisioning is needed here.
 * We log new members for visibility; hook in CRM / welcome flows downstream.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const headers = Object.fromEntries(request.headers);

  let event;
  try {
    // Throws if the signature is missing/invalid → reject.
    event = whopsdk.webhooks.unwrap(body, { headers });
  } catch (err) {
    console.error("[whop] webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "payment.succeeded") {
    await handlePaymentSucceeded(event.data);
  }

  return new Response("OK", { status: 200 });
}

async function handlePaymentSucceeded(payment: PaymentSucceeded["data"]) {
  const userId = payment.user?.id ?? null;
  let name = payment.user?.name ?? payment.user?.username ?? null;
  const memberId = payment.member?.id ?? null;

  // The payment payload doesn't include email — enrich from the member record
  // (requires the `member:email:read` permission on the API key).
  let email: string | null = null;
  if (memberId) {
    try {
      const member = await whopsdk.members.retrieve(memberId);
      email = member.user?.email ?? null;
      name = name ?? member.user?.name ?? null;
    } catch (err) {
      console.error("[whop] failed to enrich member details", err);
    }
  }

  console.log("[whop] payment.succeeded — new member", {
    name,
    email,
    userId,
    memberId,
    planId: payment.plan?.id ?? null,
    productId: payment.product?.id ?? null,
    paymentId: payment.id,
  });
}
