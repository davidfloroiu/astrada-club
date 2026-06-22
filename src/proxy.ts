import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (Next.js 16's renamed Middleware). Runs before routes are rendered.
 *
 * Sole job: when a request comes from the Astrada native app shell, keep it out
 * of the public marketing/apply funnel. Members only ever *sign in* in the app
 * — there is no join/apply/purchase path — so we bounce the funnel entry points
 * straight to the member area. Web visitors are never affected.
 *
 * Note: the literal "AstradaApp" mirrors NATIVE_UA_MARKER in src/lib/native.ts;
 * it's inlined here so this file doesn't pull `next/headers` into the proxy.
 */
const NATIVE_UA_MARKER = "AstradaApp";
const FUNNEL_PATHS = new Set(["/", "/join", "/apply"]);

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua.includes(NATIVE_UA_MARKER)) return; // web visitors: untouched

  if (FUNNEL_PATHS.has(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
}

// Only run on the funnel entry points (keeps the proxy off every other request).
export const config = {
  matcher: ["/", "/join", "/apply"],
};
