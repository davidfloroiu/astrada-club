import { headers } from "next/headers";

/**
 * Marker the Astrada native (Capacitor) shell appends to its WebView
 * user-agent — see `appendUserAgent` in capacitor.config.ts. We use it to
 * render a members-only experience in the app: no marketing, no apply/join
 * funnel, no purchase paths (Apple "reader app" posture — members only sign in).
 *
 * Keep this string in sync with capacitor.config.ts. `src/proxy.ts` inlines the
 * same literal so it doesn't pull `next/headers` into the proxy bundle.
 */
export const NATIVE_UA_MARKER = "AstradaApp";

/** True when the current request comes from the Astrada native app shell. */
export async function isNativeApp(): Promise<boolean> {
  const ua = (await headers()).get("user-agent") ?? "";
  return ua.includes(NATIVE_UA_MARKER);
}
