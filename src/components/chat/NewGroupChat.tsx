"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, X, Search, Check, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface Member {
  userId: string;
  name: string;
  username: string;
  isAdmin: boolean;
}

/**
 * Create a group chat: pick two or more members (and an optional name), and
 * we open a multi-person Whop DM channel and drop you straight into it. Members
 * are loaded lazily the first time the picker opens.
 */
export function NewGroupChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [loadErr, setLoadErr] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || members !== null) return;
    let active = true;
    fetch("/api/members")
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
      if (e.key === "Escape" && !creating) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, creating]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function create() {
    if (selected.size < 2 || creating) return;
    setCreating(true);
    setErr(null);
    try {
      const res = await fetch("/api/dms/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [...selected], name: name.trim() }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        channelId?: string;
        error?: string;
      };
      if (res.ok && d.channelId) {
        setOpen(false);
        router.push(`/messages?c=${encodeURIComponent(d.channelId)}`);
        return;
      }
      setErr(d.error || "Couldn't create the group.");
    } catch {
      setErr("Couldn't create the group.");
    } finally {
      setCreating(false);
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
        onClick={() => {
          // Open fresh — clear any stale selection/name/query from a prior open.
          setSelected(new Set());
          setName("");
          setQuery("");
          setErr(null);
          setOpen(true);
        }}
        className="focus-ring inline-flex items-center gap-2 rounded-full border border-line-strong bg-paper px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist"
      >
        <Users className="h-4 w-4" />
        New group
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => !creating && setOpen(false)}
          />
          <div className="relative z-10 flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-line bg-paper shadow-[var(--shadow-card)] sm:rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                  New group chat
                </h2>
                <p className="text-xs text-muted">
                  Pick two or more members to start a private group.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !creating && setOpen(false)}
                aria-label="Close"
                className="focus-ring rounded-lg p-1.5 text-faint hover:bg-mist hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3 px-5 pt-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                placeholder="Group name (optional)"
                className="focus-ring w-full rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-faint"
              />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members"
                  className="focus-ring w-full rounded-xl border border-line bg-canvas py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-faint"
                />
              </div>
            </div>

            {/* Member list */}
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {members === null && !loadErr && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading members…
                </div>
              )}
              {loadErr && (
                <p className="px-3 py-10 text-center text-sm text-muted">
                  Couldn&rsquo;t load members. Try again in a moment.
                </p>
              )}
              {members !== null && filtered.length === 0 && (
                <p className="px-3 py-10 text-center text-sm text-muted">
                  No members match &ldquo;{query}&rdquo;.
                </p>
              )}
              {filtered.map((m) => {
                const on = selected.has(m.userId);
                return (
                  <button
                    key={m.userId}
                    type="button"
                    onClick={() => toggle(m.userId)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                      on ? "bg-azure/10" : "hover:bg-mist/70",
                    )}
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
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
                        on
                          ? "border-azure bg-azure text-canvas"
                          : "border-line-strong",
                      )}
                    >
                      {on && <Check className="h-3.5 w-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {err && <p className="mb-2 text-xs text-danger">{err}</p>}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-muted">
                  {selected.size === 0
                    ? "No one selected"
                    : `${selected.size} selected`}
                </span>
                <button
                  type="button"
                  onClick={create}
                  disabled={selected.size < 2 || creating}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600 disabled:opacity-50"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {creating ? "Creating…" : "Create group"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
