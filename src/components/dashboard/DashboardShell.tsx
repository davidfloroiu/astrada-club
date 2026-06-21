"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  Mail,
  Users,
  CalendarDays,
  Gift,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/forum", label: "Forum", icon: Newspaper },
  { href: "/messages", label: "Messages", icon: Mail },
  { href: "/members", label: "Members", icon: Users },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/deals", label: "Perks", icon: Gift },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-mist text-navy"
                : "text-slate hover:bg-mist/70 hover:text-navy",
            )}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] transition-colors",
                active ? "text-azure" : "text-faint group-hover:text-slate",
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <div className="px-1 pt-1">
        <Logo />
      </div>

      <NavList onNavigate={onNavigate} />

      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-xs text-slate transition-colors hover:text-navy"
      >
        Back to site
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>

      {user && (
        <div className="rounded-2xl border border-line bg-mist/50 p-3">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">
                {user.email || user.username || "Member"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Badge tone="azure">Active member</Badge>
            <button
              onClick={signOut}
              className="focus-ring rounded-md p-1.5 text-faint transition-colors hover:text-navy"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [drawer, setDrawer] = useState(false);

  // The dashboard route group is gated server-side; this is a defensive guard.
  if (!user) return null;

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-paper lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-canvas/85 px-4 backdrop-blur-xl lg:hidden">
        <Logo />
        <button
          onClick={() => setDrawer(true)}
          className="focus-ring rounded-md p-2 text-navy"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-line bg-paper">
            <button
              onClick={() => setDrawer(false)}
              className="focus-ring absolute right-3 top-4 rounded-md p-2 text-slate"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarBody onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <div className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
