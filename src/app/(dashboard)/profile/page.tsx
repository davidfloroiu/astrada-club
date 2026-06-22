"use client";

import Link from "next/link";
import {
  Users,
  UserPlus,
  CalendarDays,
  Gift,
  LogOut,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { NotificationsToggle } from "@/components/pwa/NotificationsToggle";
import { useAuth } from "@/lib/auth";

// Secondary destinations that aren't in the bottom tab bar live here.
const more = [
  { href: "/members", label: "Members", desc: "Browse the directory", icon: Users },
  { href: "/network", label: "Network", desc: "Your connections & intros", icon: UserPlus },
  { href: "/events", label: "Events", desc: "What's on the calendar", icon: CalendarDays },
  { href: "/deals", label: "Perks", desc: "Member benefits", icon: Gift },
];

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-8">
      <header>
        <SectionLabel tone="azure">Profile</SectionLabel>
        <div className="mt-4 flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-ink">
              {user.name}
            </h1>
            <p className="truncate text-sm text-muted">
              {user.email || user.username || "Member"}
            </p>
            <div className="mt-2">
              <Badge tone="azure">
                {user.isAdmin ? "Team · admin" : "Active member"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <NotificationsToggle />

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-faint">
          Explore
        </h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          {more.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "focus-ring flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-mist/60" +
                  (i > 0 ? " border-t border-line" : "")
                }
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-azure/10 text-azure">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {item.desc}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-faint">
          Account
        </h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <Link
            href="/"
            className="focus-ring flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-mist/60"
          >
            <span className="min-w-0 flex-1 text-sm font-medium text-ink">
              Back to website
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-faint" />
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="focus-ring flex w-full items-center gap-4 border-t border-line px-4 py-3.5 text-left transition-colors hover:bg-mist/60"
          >
            <span className="min-w-0 flex-1 text-sm font-medium text-red-700">
              Sign out
            </span>
            <LogOut className="h-4 w-4 shrink-0 text-red-700/70" />
          </button>
        </div>
      </section>
    </div>
  );
}
