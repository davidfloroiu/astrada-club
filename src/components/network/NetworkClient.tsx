"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Mail, Handshake, UserCheck } from "lucide-react";
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

function Row({
  member,
  children,
}: {
  member: DirectoryMember;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3">
      <Link href={`/members/${member.userId}`} className="focus-ring rounded-full">
        <Avatar name={member.name} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/members/${member.userId}`}
          className="truncate text-sm font-medium text-ink hover:text-navy"
        >
          {member.name}
        </Link>
        {member.username && (
          <p className="truncate text-xs text-muted">@{member.username}</p>
        )}
      </div>
      {children}
    </li>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-faint">
        {title}
        {count > 0 && (
          <span className="rounded-full bg-azure/10 px-2 py-0.5 text-[11px] font-semibold text-azure-deep">
            {count}
          </span>
        )}
      </h2>
      {children}
    </section>
  );
}

/** The network hub: incoming requests, intro requests, and your connections. */
export function NetworkClient({
  initialIncoming,
  initialConnections,
  initialIntros,
}: {
  initialIncoming: DirectoryMember[];
  initialConnections: DirectoryMember[];
  initialIntros: Intro[];
}) {
  const [incoming, setIncoming] = useState(initialIncoming);
  const [connections, setConnections] = useState(initialConnections);
  const [intros, setIntros] = useState(initialIntros);
  const [busy, setBusy] = useState<string | null>(null);

  async function acceptRequest(m: DirectoryMember) {
    setBusy(m.userId);
    if (await connAction("accept", m.userId)) {
      setIncoming((p) => p.filter((x) => x.userId !== m.userId));
      setConnections((p) => [m, ...p]);
    }
    setBusy(null);
  }
  async function declineRequest(m: DirectoryMember) {
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

  const empty =
    incoming.length === 0 && connections.length === 0 && intros.length === 0;

  if (empty) {
    return (
      <div className="card-surface flex flex-col items-center gap-3 px-6 py-20 text-center">
        <p className="font-display text-lg font-semibold tracking-tight text-ink">
          Your network is just getting started
        </p>
        <p className="max-w-md text-sm leading-relaxed text-slate">
          Head to the directory to connect with other members. Once you&rsquo;re
          connected, you can see who you both know and ask for warm
          introductions.
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
    <div className="grid gap-10">
      {incoming.length > 0 && (
        <Section title="Connection requests" count={incoming.length}>
          <ul className="grid gap-3">
            {incoming.map((m) => (
              <Row key={m.userId} member={m}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busy === m.userId}
                    onClick={() => acceptRequest(m)}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-600 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={busy === m.userId}
                    onClick={() => declineRequest(m)}
                    aria-label="Decline"
                    className="focus-ring rounded-full border border-line p-2 text-slate hover:bg-mist hover:text-navy disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Row>
            ))}
          </ul>
        </Section>
      )}

      {intros.length > 0 && (
        <Section title="Intro requests" count={intros.length}>
          <ul className="grid gap-3">
            {intros.map((i) => (
              <li
                key={i.id}
                className="rounded-2xl border border-line bg-paper px-4 py-4"
              >
                <div className="flex items-start gap-3">
                  <Handshake className="mt-0.5 h-5 w-5 shrink-0 text-azure" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-relaxed text-ink">
                      <Link
                        href={`/members/${i.from.userId}`}
                        className="font-medium hover:text-navy"
                      >
                        {i.from.name}
                      </Link>{" "}
                      would like an introduction to{" "}
                      <Link
                        href={`/members/${i.target.userId}`}
                        className="font-medium hover:text-navy"
                      >
                        {i.target.name}
                      </Link>
                      .
                    </p>
                    {i.note && (
                      <p className="mt-1.5 rounded-xl bg-mist/60 px-3 py-2 text-sm leading-relaxed text-slate">
                        “{i.note}”
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
        </Section>
      )}

      <Section title="Your connections" count={connections.length}>
        {connections.length === 0 ? (
          <p className="text-sm text-slate">
            No connections yet.{" "}
            <Link href="/members" className="text-azure hover:text-azure-bright">
              Find members to connect with
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {connections.map((m) => (
              <Row key={m.userId} member={m}>
                <Link
                  href="/messages"
                  aria-label={`Message ${m.name}`}
                  className="focus-ring rounded-full border border-line p-2 text-slate hover:bg-mist hover:text-navy"
                >
                  <Mail className="h-4 w-4" />
                </Link>
              </Row>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
