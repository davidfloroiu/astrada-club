import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/whop/session";
import { buildAuthorizeUrl, createPkce } from "@/lib/whop/oauth";
import { whop } from "@/lib/whop/config";

export const dynamic = "force-dynamic";

/** Start the Whop OAuth 2.1 + PKCE flow. */
export async function GET(request: NextRequest) {
  if (!whop.appId) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const rawReturnTo = request.nextUrl.searchParams.get("returnTo") || "/dashboard";
  // Only honor same-origin relative paths — blocks an open-redirect where a
  // crafted ?returnTo=https://evil.com (or //evil.com) bounces a freshly
  // authenticated member off-site for phishing.
  const returnTo =
    rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
      ? rawReturnTo
      : "/dashboard";
  const pkce = createPkce();

  const session = await getSession();
  session.oauth = { ...pkce, returnTo };
  await session.save();

  const authorizeUrl = await buildAuthorizeUrl(pkce);
  return NextResponse.redirect(authorizeUrl);
}
