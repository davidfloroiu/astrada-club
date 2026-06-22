import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/whop/session";
import { exchangeCode, fetchUserInfo } from "@/lib/whop/oauth";
import { checkProductAccess } from "@/lib/whop/access";

export const dynamic = "force-dynamic";

/** OAuth callback: verify state, exchange code, load profile, gate on membership. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  const session = await getSession();
  const pending = session.oauth;

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, request.url));

  if (oauthError) return fail("denied");
  if (!code || !returnedState || !pending) return fail("invalid");
  if (returnedState !== pending.state) return fail("state");

  try {
    const tokens = await exchangeCode(code, pending.codeVerifier);
    const info = await fetchUserInfo(tokens.access_token);

    const { hasAccess, accessLevel } = await checkProductAccess(info.sub);

    // Persist the session; drop the transient OAuth state.
    session.userId = info.sub;
    session.name = info.name ?? info.username ?? "Member";
    session.email = info.email ?? "";
    session.username = info.username ?? info.preferred_username;
    session.profilePicture = info.picture;
    session.hasAccess = hasAccess;
    session.accessLevel = accessLevel;
    session.oauth = undefined;
    await session.save();

    // Defensive re-check: only redirect to a same-origin relative path even if
    // the stored returnTo was somehow tampered with (open-redirect guard).
    const safeReturnTo =
      pending.returnTo &&
      pending.returnTo.startsWith("/") &&
      !pending.returnTo.startsWith("//")
        ? pending.returnTo
        : "/dashboard";
    const dest = hasAccess ? safeReturnTo : "/join?reason=no-access";
    return NextResponse.redirect(new URL(dest, request.url));
  } catch (err) {
    console.error("[whop] OAuth callback failed", err);
    return fail("exchange");
  }
}
