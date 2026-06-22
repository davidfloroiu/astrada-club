"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ConnectButton } from "@/components/network/ConnectButton";
import { MessageButton } from "@/components/chat/MessageButton";
import type { DirectoryMember } from "@/lib/members/directory";
import type { ConnectionStatus } from "@/lib/network/store";

export type DirectoryEntry = DirectoryMember & {
  status: ConnectionStatus;
  industry?: string;
  location?: string;
};

/**
 * The member directory — real members from Whop, each with a connect control.
 * Search is client-side over the provided list.
 */
export function MembersDirectory({ members }: { members: DirectoryEntry[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q),
    );
  }, [query, members]);

  if (members.length === 0) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 px-6 py-20 text-center">
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          The directory is just getting started
        </p>
        <p className="max-w-md text-sm leading-relaxed text-slate">
          As founding members join, they&rsquo;ll appear here — connect with them,
          see who you both know, and ask for a warm introduction.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username"
            className="w-full rounded-xl border border-line bg-paper px-4 py-3 pl-10 text-sm text-ink placeholder:text-faint focus-ring transition-colors sm:w-80"
            aria-label="Search members"
          />
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "member" : "members"}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <article key={m.userId} className="card-surface flex h-full flex-col p-6">
            <Link
              href={`/members/${m.userId}`}
              className="focus-ring flex items-start gap-4 rounded-xl"
            >
              <Avatar name={m.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-xl font-semibold leading-tight tracking-tight text-ink">
                  {m.name}
                </h3>
                {m.username && (
                  <p className="truncate text-sm text-slate">@{m.username}</p>
                )}
                {(m.industry || m.location) && (
                  <p className="mt-1 truncate text-xs text-muted">
                    {[m.industry, m.location].filter(Boolean).join(" · ")}
                  </p>
                )}
                {m.isAdmin && (
                  <span className="mt-1 inline-block rounded-full bg-azure/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-azure-deep">
                    Team
                  </span>
                )}
              </div>
            </Link>

            <div className="mt-auto flex items-center justify-between gap-2 pt-5">
              <Link
                href={`/members/${m.userId}`}
                className="text-xs text-muted transition-colors hover:text-navy"
              >
                View profile
              </Link>
              <div className="flex items-center gap-2">
                <MessageButton userId={m.userId} name={m.name} variant="icon" />
                <ConnectButton userId={m.userId} initialStatus={m.status} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
