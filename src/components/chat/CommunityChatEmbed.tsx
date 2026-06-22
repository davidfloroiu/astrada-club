"use client";

import {
  ChatElement,
  ChatSession,
  Elements,
} from "@whop/embedded-components-react-js";
import { loadWhopElements } from "@whop/embedded-components-vanilla-js";
import { useTheme } from "@/lib/theme";
import { whopAppearance } from "@/lib/whop/appearance";

// Load the Whop elements runtime once on the client. This module is only ever
// imported in the browser (its parent uses next/dynamic with ssr: false).
const elements = loadWhopElements();

/**
 * Fetch a short-lived, server-minted access token scoped to the signed-in
 * member. Passing the function (rather than a static string) lets the SDK
 * refresh it automatically before it expires.
 */
async function fetchChatToken(): Promise<string> {
  const res = await fetch("/api/chat/token", { method: "POST" });
  if (!res.ok) throw new Error("Unable to authenticate chat session");
  const data = (await res.json()) as { token: string };
  return data.token;
}

function ChatFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-azure" />
        <p className="text-sm text-muted">Connecting to the community…</p>
      </div>
    </div>
  );
}

/**
 * The live Astrada community chat, embedded from Whop. Real-time and in sync
 * with whop.com — same channel, same messages.
 */
export default function CommunityChatEmbed({
  channelId,
}: {
  channelId: string;
}) {
  const { resolved } = useTheme();
  return (
    <div
      className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[var(--shadow-card)]"
      style={{ height: "76vh", minHeight: 520 }}
    >
      <Elements elements={elements} appearance={whopAppearance(resolved)}>
        <ChatSession token={fetchChatToken}>
          {/* key forces a clean remount when switching rooms; the Elements +
              ChatSession (and its token) stay mounted above. */}
          <ChatElement
            key={channelId}
            options={{ channelId }}
            style={{ height: "100%", width: "100%" }}
            fallback={<ChatFallback />}
          />
        </ChatSession>
      </Elements>
    </div>
  );
}
