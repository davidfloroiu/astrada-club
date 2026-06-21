"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Opens a direct message with a specific member. Any member can message any
 * other member (Whop DMs are company-wide, not connection-gated). On success we
 * deep-link into the Messages view with the conversation open; if opening the
 * channel hiccups, we fall back to the inbox so the action never dead-ends.
 */
export function MessageButton({
  userId,
  name,
  variant = "full",
  className,
}: {
  userId: string;
  name?: string;
  variant?: "full" | "icon";
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function open() {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/dms/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const d = (await res.json().catch(() => ({}))) as { channelId?: string };
      if (res.ok && d.channelId) {
        router.push(`/messages?c=${encodeURIComponent(d.channelId)}`);
        return;
      }
      router.push("/messages");
    } catch {
      router.push("/messages");
    } finally {
      setPending(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={open}
        disabled={pending}
        aria-label={name ? `Message ${name}` : "Message"}
        className={cn(
          "focus-ring rounded-full border border-line p-2 text-slate transition-colors hover:bg-mist hover:text-navy disabled:opacity-60",
          className,
        )}
      >
        <Mail className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={open}
      disabled={pending}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist disabled:opacity-60",
        className,
      )}
    >
      <Mail className="h-4 w-4" />
      {pending ? "Opening…" : "Message"}
    </button>
  );
}
