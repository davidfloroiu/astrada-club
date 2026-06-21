import "server-only";
import { whopsdk } from "./sdk";
import { whop } from "./config";

export interface AccessResult {
  hasAccess: boolean;
  accessLevel: string;
}

/**
 * Check whether a Whop user has an active membership on the Astrada product.
 * Uses the company API key. Fails closed (no access) on any error.
 */
export async function checkProductAccess(userId: string): Promise<AccessResult> {
  try {
    const res = await whopsdk.users.checkAccess(whop.productId, { id: userId });
    return { hasAccess: Boolean(res.has_access), accessLevel: res.access_level };
  } catch (err) {
    console.error("[whop] checkAccess failed", err);
    return { hasAccess: false, accessLevel: "no_access" };
  }
}
