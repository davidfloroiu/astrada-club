"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, X, Search, Loader2, UserPlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface Member {
  userId: string;
  name: string;
  username: string;
  isAdmin: boolean;
}

/**
 * Start a 1:1 conversation with one of your connections. Messaging is
 * network-gated, so this lists only members you're connected with (others must
 * accept a connection request first). Clicking a member opens the DM.
 */
export function NewDirectMessage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [query, setQuery] = useState("");
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    if (!open || members !== null) return;
    let active = true;
    fetch("/api/network/contacts")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error())))
      .then((d: { members: Member[] }) => active && setMembers(d.members))
      .catch(() => active && setLoadErr(true));
    return () => {
      active = false;
    };
  }, [open, members]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !opening) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, opening]);

  async function openDm(userId: string) {
    if (opening) return;
    setOpening(userId);
    try {
      const res = await fetch("/api/dms/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const d = (await res.json().catch(() => ({}))) as { channelId?: string };
      if (res.ok && d.channelId) {
        setOpen(false);
        router.push(`/messages?c=${encodeURIComponent(d.channelId)}`);
        return;
      }
      router.push("/messages");
    } catch {
      router.push("/messages");
    } finally {
      setOpening(null);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = (members ?? []).filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.username.toLowerCase().includes(q),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600"
      >
        <Mail className="h-4 w-4" />
        Message
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => !opening && setOpen(false)}
          />
          <div className="relative z-10 flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-line bg-paper shadow-[var(--shadow-card)] sm:rounded-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                  New message
                </h2>
                <p className="text-xs text-muted">
                  Start a 1:1 with someone in your network.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !opening && setOpen(false)}
                aria-label="Close"
                className="focus-ring rounded-lg p-1.5 text-faint hover:bg-mist hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {members !== null && members.length > 0 && (
              <div className="px-5 pt-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search connections"
                    className="focus-ring w-full rounded-xl border border-line bg-canvas py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-faint"
                  />
                </div>
              </div>
            )}

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-3">
              {members === null && !loadErr && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              )}
              {loadErr && (
                <p className="px-3 py-10 text-center text-sm text-muted">
                  Couldn&rsquo;t load your connections. Try again in a moment.
                </p>
              )}
              {members !== null && members.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-mist text-slate">
                    <UserPlus className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-medium text-ink">
                    No connections yet
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    You can message members once you&rsquo;re connected. Find
                    people to connect with in the directory.
                  </p>
                  <Link
                    href="/members"
                    onClick={() => setOpen(false)}
                    className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-mist"
                  >
                    Browse members
                  </Link>
                </div>
              )}
              {filtered.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => openDm(m.userId)}
                  disabled={opening !== null}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-mist/70 disabled:opacity-60"
                >
                  <Avatar name={m.name} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {m.name}
                    </span>
                    {m.username && (
                      <span className="block truncate text-xs text-muted">
                        @{m.username}
                      </span>
                    )}
                  </span>
                  {opening === m.userId && (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-azure" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
