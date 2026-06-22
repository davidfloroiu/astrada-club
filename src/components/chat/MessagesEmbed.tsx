"use client";

import { useState } from "react";
import { MailX } from "lucide-react";
import {
  ChatElement,
  ChatSession,
  DmsListElement,
  Elements,
} from "@whop/embedded-components-react-js";
import { loadWhopElements } from "@whop/embedded-components-vanilla-js";
import { whop } from "@/lib/whop/config";
import { useTheme } from "@/lib/theme";
import { whopAppearance } from "@/lib/whop/appearance";

// Load the Whop elements runtime once on the client. This module is only ever
// imported in the browser (its parent uses next/dynamic with ssr: false).
const elements = loadWhopElements();

async function fetchDmToken(): Promise<string> {
  const res = await fetch("/api/dms/token", { method: "POST" });
  if (!res.ok) throw new Error("Unable to authenticate messages");
  const data = (await res.json()) as { token: string };
  return data.token;
}

/** Pull the selected DM channel id out of the DmsListElement event, defensively. */
function channelIdFromEvent(event: unknown): string | undefined {
  const e = event as { detail?: { id?: string }; id?: string } | null;
  return e?.detail?.id ?? e?.id;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-azure" />
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}

/**
 * Direct messages, embedded from Whop: the DM inbox on the left, the selected
 * conversation on the right. One ChatSession (and its token) stays mounted; only
 * the thread's <ChatElement> remounts when you switch conversations.
 */
export default function MessagesEmbed({
  initialChannelId,
}: {
  initialChannelId?: string | null;
}) {
  const [channelId, setChannelId] = useState<string | null>(
    initialChannelId ?? null,
  );
  const { resolved } = useTheme();

  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-2xl border border-line bg-paper shadow-[var(--shadow-card)] lg:grid-cols-[320px_minmax(0,1fr)]"
      style={{ height: "76vh", minHeight: 520 }}
    >
      <Elements elements={elements} appearance={whopAppearance(resolved)}>
        <ChatSession token={fetchDmToken}>
          {/* Inbox */}
          <div className="min-h-0 border-b border-line lg:border-b-0 lg:border-r">
            <DmsListElement
              options={{
                companyId: whop.companyId,
                selectedChannel: channelId ?? undefined,
                onEvent: (event) => {
                  const id = channelIdFromEvent(event);
                  if (id) setChannelId(id);
                },
              }}
              style={{ height: "100%", width: "100%" }}
              fallback={<Spinner label="Loading your messages…" />}
            />
          </div>

          {/* Active conversation */}
          <div className="hidden min-h-0 lg:block">
            {channelId ? (
              <ChatElement
                key={channelId}
                options={{ channelId }}
                style={{ height: "100%", width: "100%" }}
                fallback={<Spinner label="Opening conversation…" />}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <MailX className="h-8 w-8 text-faint" />
                <p className="font-display text-lg font-semibold tracking-tight text-ink">
                  No conversation selected
                </p>
                <p className="max-w-xs text-sm leading-relaxed text-slate">
                  Pick a conversation from your inbox, or start a new one to
                  message another member one-on-one.
                </p>
              </div>
            )}
          </div>

          {/* On mobile, the thread takes over the full panel when one is open. */}
          {channelId && (
            <div className="min-h-0 border-t border-line lg:hidden">
              <ChatElement
                key={`m-${channelId}`}
                options={{ channelId }}
                style={{ height: "60vh", width: "100%" }}
                fallback={<Spinner label="Opening conversation…" />}
              />
            </div>
          )}
        </ChatSession>
      </Elements>
    </div>
  );
}
