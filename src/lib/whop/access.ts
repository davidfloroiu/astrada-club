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
  // Primary: use the SDK's checkAccess
  const res = await whopsdk.users.checkAccess(whop.productId, { id: userId });

  if (res.has_access) {
    return {
      hasAccess: true,
      accessLevel: res.access_level as AccessLevel,
    };
  }

  // Fallback: checkAccess returns false for `trialing` memberships (no payment method attached).
  // Directly query the memberships API and treat `active` + `trialing` as valid.
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
  } catch {
    // fallback failed — default to no access
  }

  return { hasAccess: false, accessLevel: "no_access" };
}
