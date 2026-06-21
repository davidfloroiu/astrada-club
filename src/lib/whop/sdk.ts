import "server-only";
import Whop from "@whop/sdk";

/**
 * Server-side Whop SDK client, authenticated with the company API key.
 * Used for membership checks, short-lived embed tokens, and webhook unwrapping.
 *
 * Webhook key: the `standardwebhooks` library (used by `webhooks.unwrap`) expects
 * a base64 secret. Whop's dashboard gives a raw secret, so we base64-encode it
 * unless it's already a `whsec_`-prefixed key. See docs.whop.com/developer/guides/webhooks.
 */
function webhookKey(): string | null {
  const raw = process.env.WHOP_WEBHOOK_SECRET;
  if (!raw) return null;
  return raw.startsWith("whsec_")
    ? raw
    : Buffer.from(raw, "utf8").toString("base64");
}

export const whopsdk = new Whop({
  apiKey: process.env.WHOP_API_KEY ?? "",
  webhookKey: webhookKey(),
});
