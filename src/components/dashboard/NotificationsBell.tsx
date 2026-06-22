"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Header bell → /notifications, with a live unread badge (pending connection +
 * intro requests). Refetches on navigation and when the tab regains focus, so
 * acting on a request elsewhere clears the badge without a reload.
 */
export function NotificationsBell({ className }: { className?: string }) {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      fetch("/api/notifications/count")
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d: { count?: number }) => {
          if (active) setCount(d.count ?? 0);
        })
        .catch(() => {});
    };
    load();
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    // Refetch when the inbox marks notifications read (avoids a stale badge).
    const onRead = () => load();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("astrada:notifications-read", onRead);
    const id = window.setInterval(load, 60000);
    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("astrada:notifications-read", onRead);
      window.clearInterval(id);
    };
  }, [pathname]);

  const active = pathname === "/notifications";

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `Notifications, ${count} new` : "Notifications"}
      className={cn(
        "focus-ring relative grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-mist",
        active && "bg-mist",
        className,
      )}
    >
      <Bell className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-azure px-1 text-[10px] font-semibold leading-none text-canvas ring-2 ring-canvas">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
