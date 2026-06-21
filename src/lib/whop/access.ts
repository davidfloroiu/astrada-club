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

/** Whop team roles treated as admins/moderators (can create events, manage). */
const ADMIN_ROLES = new Set(["owner", "admin", "moderator"]);

/**
 * Is this user an admin/moderator on the company team? Checked via the company's
 * authorized users (requires the company API key). Fails closed (false).
 */
export async function isCompanyAdmin(userId: string): Promise<boolean> {
  try {
    const page = await whopsdk.authorizedUsers.list({
      company_id: whop.companyId,
      user_id: userId,
      first: 1,
    });
    const entry = (page.data ?? [])[0];
    return Boolean(entry && ADMIN_ROLES.has(entry.role));
  } catch (err) {
    console.error("[whop] authorized-user (admin) check failed", err);
    return false;
  }
}

export async function checkProductAccess(userId: string): Promise<ProductAccessResult> {
  // Company admins/moderators always have access — and the "admin" level unlocks
  // event creation and other management UI.
  if (await isCompanyAdmin(userId)) {
    return { hasAccess: true, accessLevel: "admin" };
  }

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
  // company_id, which the company key is authorized for) and accept any
  // active/trialing membership on our product.
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
