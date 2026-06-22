"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Gift,
  MapPin,
  Sparkles,
  MessagesSquare,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { NotificationsToggle } from "@/components/pwa/NotificationsToggle";
import { ProfilePrompt } from "@/components/dashboard/ProfilePrompt";
import { useAuth } from "@/lib/auth";
import { perks } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { ClubEvent } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ClubEvent[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/events")
      .then((r) => (r.ok ? r.json() : { events: [] }))
      .then((d: { events?: ClubEvent[] }) => {
        if (active) setEvents(d.events ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!user) return null;

  const firstName = user.name.split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const todayIso = new Date().toLocaleDateString("en-CA"); // local YYYY-MM-DD
  const upcoming = events
    .filter((e) => e.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const featuredPerks = perks.slice(0, 3);

  return (
    <div className="space-y-10">
      {/* Greeting */}
      <header>
        <SectionLabel tone="azure">{today}</SectionLabel>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
          Your community is live. Jump into the chat, or explore the rooms and
          perks taking shape as the founding circle comes together.
        </p>
      </header>

      <ProfilePrompt />

      {/* Live community spotlight — the real Whop chat */}
      <section className="section-navy overflow-hidden rounded-2xl p-7 sm:p-9">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <Badge tone="light">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" />
              Live now
            </Badge>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              The community chat is open
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-platinum">
              Real-time and in sync with whop.com — same channel, same people.
              Say hello and introduce what you&rsquo;re building.
            </p>
          </div>
          <Button href="/chat" variant="light" size="lg">
            Open chat
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/chat" className="card-surface focus-ring block p-5 transition-colors hover:border-azure/30">
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-wide text-faint">Chat</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-azure/10 text-azure">
              <MessagesSquare className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
            Live chat
          </p>
          <p className="mt-1 text-xs text-muted">Open the conversation</p>
        </Link>

        <div className="card-surface p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-wide text-faint">Membership</p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-azure/10 text-azure">
              <BadgeCheck className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
            Active
          </p>
          <p className="mt-1 text-xs text-muted">
            {user.isAdmin ? "Team · admin" : "Founding member"}
          </p>
        </div>

        <Link
          href="/events"
          className="card-surface focus-ring block p-5 transition-colors hover:border-azure/30"
        >
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-wide text-faint">
              Upcoming events
            </p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-azure/10 text-azure">
              <Calendar className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            {upcoming.length}
          </p>
          <p className="mt-1 text-xs text-muted">
            {upcoming.length === 0 ? "None scheduled yet" : "On the calendar"}
          </p>
        </Link>

        <div className="card-surface p-5">
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-wide text-faint">
              Member perks
            </p>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-azure/10 text-azure">
              <Gift className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">
            {perks.length}{" "}
            <span className="text-base font-normal text-muted">lining up</span>
          </p>
          <p className="mt-1 text-xs text-muted">Nothing live yet</p>
        </div>
      </div>

      {/* Push notifications opt-in (renders only where supported + configured) */}
      <NotificationsToggle />

      {/* Honest preview note */}
      <div className="flex items-start gap-3 rounded-xl border border-line bg-mist/60 px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-azure" />
        <p className="text-sm leading-relaxed text-slate">
          The chat is live. Events are posted by admins and moderators — and the
          perks below are samples we&rsquo;re lining up as the founding circle
          forms.
        </p>
      </div>

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Upcoming events
            </h2>
            <Link
              href="/events"
              className="focus-ring text-sm text-azure hover:text-azure-bright"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {upcoming.map((event) => {
              const d = new Date(event.date + "T00:00:00");
              const day = d.getDate();
              const month = d.toLocaleDateString("en-US", { month: "short" });
              return (
                <Link
                  key={event.id}
                  href="/events"
                  className="card-surface focus-ring flex flex-col gap-4 p-5 transition-colors hover:border-azure/30 sm:flex-row sm:items-center"
                >
                  <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl border border-line bg-mist">
                    <span className="font-display text-2xl font-semibold leading-none tracking-tight text-ink">
                      {day}
                    </span>
                    <span className="mt-1 text-[11px] uppercase tracking-wide text-slate">
                      {month}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-base font-semibold tracking-tight text-ink">
                      {event.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-faint" />
                      {event.city} · {event.venue}
                    </p>
                    <p className="mt-1 text-xs text-faint">
                      {formatDate(event.date)} · {event.time}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Perks we're lining up */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Perks we&apos;re lining up
          </h2>
          <Link
            href="/deals"
            className="focus-ring text-sm text-azure hover:text-azure-bright"
          >
            All perks
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPerks.map((perk) => (
            <div key={perk.id} className="card-surface p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-azure/10 font-display text-azure-deep">
                {perk.monogram}
              </div>
              <h3 className="mt-4 font-display text-base font-semibold tracking-tight text-ink">
                {perk.title}
              </h3>
              <p className="mt-1 text-sm text-slate">{perk.category}</p>
              <div className="mt-4">
                <Badge tone="neutral">{perk.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
