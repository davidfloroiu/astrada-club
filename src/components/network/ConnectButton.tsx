"use client";

import { useState } from "react";
import { UserPlus, Clock, Check, UserCheck } from "lucide-react";
import type { ConnectionStatus } from "@/lib/network/store";
import { cn } from "@/lib/utils";

type Action = "request" | "accept" | "decline" | "remove";

async function act(userId: string, action: Action): Promise<ConnectionStatus | null> {
  try {
    const res = await fetch("/api/network/connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId }),
    });
    const d = (await res.json().catch(() => ({}))) as { status?: ConnectionStatus };
    if (!res.ok) return null;
    return d.status ?? null;
  } catch {
    return null;
  }
}

/**
 * The connect control for a member. Reflects the viewer's relationship and
 * flips optimistically: Connect → Requested, Accept → Connected, etc.
 */
export function ConnectButton({
  userId,
  initialStatus,
  className,
  onStatusChange,
}: {
  userId: string;
  initialStatus: ConnectionStatus;
  className?: string;
  onStatusChange?: (status: ConnectionStatus) => void;
}) {
  const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
  const [pending, setPending] = useState(false);

  async function run(action: Action, optimistic: ConnectionStatus) {
    if (pending) return;
    setPending(true);
    const prev = status;
    setStatus(optimistic);
    const result = await act(userId, action);
    const next = result ?? prev;
    setStatus(next);
    onStatusChange?.(next);
    setPending(false);
  }

  const base =
    "focus-ring inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60";

  if (status === "connected") {
    return (
      <span
        className={cn(
          base,
          "cursor-default border border-line bg-mist text-navy",
          className,
        )}
      >
        <UserCheck className="h-4 w-4" />
        Connected
      </span>
    );
  }

  if (status === "incoming") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => run("accept", "connected")}
        className={cn(base, "bg-navy text-white hover:bg-navy-600", className)}
      >
        <Check className="h-4 w-4" />
        Accept request
      </button>
    );
  }

  if (status === "outgoing") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => run("remove", "none")}
        title="Cancel request"
        className={cn(
          base,
          "border border-line bg-paper text-slate hover:bg-mist hover:text-navy",
          className,
        )}
      >
        <Clock className="h-4 w-4" />
        Requested
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run("request", "outgoing")}
      className={cn(base, "bg-navy text-white hover:bg-navy-600", className)}
    >
      <UserPlus className="h-4 w-4" />
      Connect
    </button>
  );
}
