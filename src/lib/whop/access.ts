// src/lib/whop/access.ts
import "server-only";
import { whopsdk } from "./sdk";
import { whop } from "./config";

export type AccessLevel = "no_access" | "admin" | "customer";

export interface ProductAccessResult {
  hasAccess: boolean;
  accessLevel: AccessLevel;
}

/** Membership states that grant access (a trial counts — it has no payment yet). */
const VALID_STATUSES = ["active", "trialing"] as const;

export async function checkProductAccess(userId: string): Promise<ProductAccessResult> {
  // Best-effort fast path. NOTE: users.checkAccess throws a 400 ("not authorized
  // — ensure you are a team member or the app is installed") for ordinary
  // customers, so a throw here is expected and must never fail the flow.
  try {
    const res = await whopsdk.users.checkAccess(whop.productId, { id: userId });
    if (res.has_access) {
      return {
        hasAccess: true,
        accessLevel: (res.access_level as AccessLevel) ?? "customer",
      };
    }
  } catch {
    // Expected for non-team members — fall through to the memberships lookup.
  }

  // Reliable check: list this user's memberships via the SDK (scoped by
  // company_id, which the app key IS authorized for via member:basic:read) and
  // accept any active/trialing membership on our product. The legacy
  // /api/v2/memberships REST endpoint does NOT work with the app key, which is
  // why trial members were being locked out.
  try {
    const page = await whopsdk.memberships.list({
      company_id: whop.companyId,
      user_ids: [userId],
      statuses: [...VALID_STATUSES],
      first: 10,
    });

    const memberships = page.data ?? [];
    const valid = memberships.find(
      (m) =>
        m.product?.id === whop.productId &&
        (m.status === "active" || m.status === "trialing"),
    );

    if (valid) {
      return { hasAccess: true, accessLevel: "customer" };
    }

    console.log(
      `[whop] no active/trialing membership for ${userId} on ${whop.productId} (found ${memberships.length})`,
    );
  } catch (err) {
    console.error("[whop] memberships.list failed", err);
  }

  return { hasAccess: false, accessLevel: "no_access" };
}
