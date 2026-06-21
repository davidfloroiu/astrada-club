// src/lib/whop/access.ts
import "server-only";
import { whopsdk } from "./sdk";
import { whop } from "./config";

export type AccessLevel = "no_access" | "admin" | "customer";

export interface ProductAccessResult {
  hasAccess: boolean;
  accessLevel: AccessLevel;
}

export async function checkProductAccess(userId: string): Promise<ProductAccessResult> {
  // Primary: the SDK's checkAccess. NOTE: it throws a 400 ("You are not authorized
  // — ensure that you are a team member, or the app is installed") for ordinary
  // users who aren't on the company team, so a throw here is NOT fatal — we treat
  // it as inconclusive and fall through to the memberships API below. (Wrapping
  // this is essential: an unhandled throw breaks the whole sign-in callback.)
  try {
    const res = await whopsdk.users.checkAccess(whop.productId, { id: userId });
    if (res.has_access) {
      return {
        hasAccess: true,
        accessLevel: res.access_level as AccessLevel,
      };
    }
  } catch (err) {
    console.error("[whop] checkAccess failed; falling back to memberships API", err);
  }

  // Fallback: checkAccess returns false (or throws) for `trialing` memberships
  // (no payment method attached). Query the memberships API directly and treat
  // `active` + `trialing` as valid. This is also our source of truth for normal
  // members when checkAccess is unavailable.
  try {
    const params = new URLSearchParams();
    params.append("product_ids[]", whop.productId);
    params.append("user_ids[]", userId);
    params.append("per", "5");

    const fallbackRes = await fetch(
      `https://api.whop.com/api/v2/memberships?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      const memberships: Array<{ status: string; access_pass: { id: string } }> =
        data?.data ?? [];

      const validMembership = memberships.find(
        (m) => m.status === "active" || m.status === "trialing"
      );

      if (validMembership) {
        return { hasAccess: true, accessLevel: "customer" };
      }
    }
  } catch (err) {
    console.error("[whop] memberships fallback failed", err);
  }

  return { hasAccess: false, accessLevel: "no_access" };
}
