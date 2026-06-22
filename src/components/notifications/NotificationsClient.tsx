"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Handshake, UserCheck, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { DirectoryMember } from "@/lib/members/directory";

interface Intro {
  id: string;
  note: string;
  createdAt: string;
  from: DirectoryMember;
  target: DirectoryMember;
}

async function connAction(action: string, userId: string): Promise<boolean> {
  const res = await fetch("/api/network/connections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, userId }),
  });
  return res.ok;
}

async function resolveIntro(id: string, status: "done" | "dismissed"): Promise<boolean> {
  const res = await fetch(`/api/network/intros/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.ok;
}

/** The activity inbox: incoming connection requests + intro asks, inline actions. */
export function NotificationsClient({
  initialIncoming,
  initialIntros,
}: {
  initialIncoming: DirectoryMember[];
  initialIntros: Intro[];
}) {
  const [incoming, setIncoming] = useState(initialIncoming);
  const [intros, setIntros] = useState(initialIntros);
  const [busy, setBusy] = useState<string | null>(null);

  async function accept(m: DirectoryMember) {
    setBusy(m.userId);
    if (await connAction("accept", m.userId)) {
      setIncoming((p) => p.filter((x) => x.userId !== m.userId));
    }
    setBusy(null);
  }
  async function decline(m: DirectoryMember) {
    setBusy(m.userId);
    if (await connAction("decline", m.userId)) {
      setIncoming((p) => p.filter((x) => x.userId !== m.userId));
    }
    setBusy(null);
  }
  async function handleIntro(id: string, status: "done" | "dismissed") {
    setBusy(id);
    if (await resolveIntro(id, status)) {
      setIntros((p) => p.filter((x) => x.id !== id));
    }
    setBusy(null);
  }

  if (incoming.length === 0 && intros.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 px-6 py-20 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-mist text-slate">
          <Bell className="h-6 w-6" />
        </span>
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          You&rsquo;re all caught up
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-slate">
          New connection requests and intro asks will show up here.
        </p>
        <Link
          href="/members"
          className="focus-ring mt-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-600"
        >
          Browse members
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-2">
      {incoming.map((m) => (
        <li
          key={`c-${m.userId}`}
          className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3"
        >
          <Link href={`/members/${m.userId}`} className="focus-ring rounded-full">
            <Avatar name={m.name} size="sm" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug text-ink">
              <Link
                href={`/members/${m.userId}`}
                className="font-semibold hover:text-navy"
              >
                {m.name}
              </Link>{" "}
              <span className="text-slate">wants to connect.</span>
            </p>
            {m.username && (
              <p className="truncate text-xs text-muted">@{m.username}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={busy === m.userId}
              onClick={() => accept(m)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-600 disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              disabled={busy === m.userId}
              onClick={() => decline(m)}
              aria-label="Decline"
              className="focus-ring rounded-full border border-line p-2 text-slate hover:bg-mist hover:text-navy disabled:opacity-60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}

      {intros.map((i) => (
        <li
          key={`i-${i.id}`}
          className="rounded-2xl border border-line bg-paper px-4 py-4"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-azure/10 text-azure-deep">
              <Handshake className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-ink">
                <Link
                  href={`/members/${i.from.userId}`}
                  className="font-semibold hover:text-navy"
                >
                  {i.from.name}
                </Link>{" "}
                <span className="text-slate">asked for an intro to</span>{" "}
                <Link
                  href={`/members/${i.target.userId}`}
                  className="font-semibold hover:text-navy"
                >
                  {i.target.name}
                </Link>
                .
              </p>
              {i.note && (
                <p className="mt-1.5 rounded-xl bg-mist/60 px-3 py-2 text-sm leading-relaxed text-slate">
                  &ldquo;{i.note}&rdquo;
                </p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  disabled={busy === i.id}
                  onClick={() => handleIntro(i.id, "done")}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-white hover:bg-navy-600 disabled:opacity-60"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Mark as introduced
                </button>
                <button
                  type="button"
                  disabled={busy === i.id}
                  onClick={() => handleIntro(i.id, "dismissed")}
                  className="focus-ring rounded-full border border-line px-4 py-1.5 text-xs font-medium text-slate hover:bg-mist hover:text-navy disabled:opacity-60"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
