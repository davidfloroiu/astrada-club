"use client";

import dynamic from "next/dynamic";

/**
 * Client-only wrapper for the Whop DMs embed. The Whop elements runtime touches
 * browser APIs at load, so we load it with ssr: false to keep it off the server.
 */
const MessagesEmbed = dynamic(
  () => import("@/components/chat/MessagesEmbed"),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center overflow-hidden rounded-2xl border border-line bg-paper shadow-[var(--shadow-card)]"
        style={{ height: "76vh", minHeight: 520 }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-azure" />
          <p className="text-sm text-muted">Loading your messages…</p>
        </div>
      </div>
    ),
  },
);

export function Messages({
  initialChannelId,
}: {
  initialChannelId?: string | null;
}) {
  return <MessagesEmbed initialChannelId={initialChannelId} />;
}
