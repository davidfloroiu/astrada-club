"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, MessagesSquare, Mail, User } from "lucide-react";

/**
 * Liquid Glass bottom tab bar — the native app's primary navigation (the web
 * app keeps the sidebar). A warm translucent glass capsule with a sliding
 * refractive "lens" behind the active tab; the label shows only when active.
 *
 * Secondary destinations (Members, Network, Events, Perks) live under Profile.
 */
const tabs = [
  { href: "/dashboard", label: "Home", icon: Home, match: ["/dashboard"] },
  { href: "/forum", label: "Community", icon: Newspaper, match: ["/forum"] },
  { href: "/chat", label: "Chat", icon: MessagesSquare, match: ["/chat"] },
  { href: "/messages", label: "Messages", icon: Mail, match: ["/messages"] },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    // Profile is the hub for everything not in the bar.
    match: ["/profile", "/members", "/network", "/events", "/deals"],
  },
];

export function MobileTabBar() {
  const pathname = usePathname();

  const found = tabs.findIndex((t) =>
    t.match.some((m) => pathname === m || pathname.startsWith(m + "/")),
  );
  const activeIndex = found === -1 ? 0 : found;

  return (
    <nav className="tabbar" aria-label="Primary">
      <div className="tabbar-capsule">
        <span
          className="tabbar-lens"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
          aria-hidden="true"
        />
        {tabs.map((tab, i) => {
          const active = i === activeIndex;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="tabbar-tab"
              data-active={active}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
            >
              <Icon strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
              {active && <span className="tabbar-tab-label">{tab.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
