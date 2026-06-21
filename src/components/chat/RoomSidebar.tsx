"use client";

import { chatRooms } from "@/lib/whop/config";
import { cn } from "@/lib/utils";

/**
 * Room switcher for the community chat. Pure presentational React over the
 * `chatRooms` config — no Whop calls. Vertical list on desktop, horizontal
 * scroll row on mobile.
 */
export function RoomSidebar({
  activeSlug,
  onSelect,
}: {
  activeSlug: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <nav
      aria-label="Chat rooms"
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
    >
      <p className="hidden px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-faint lg:block">
        Rooms
      </p>
      {chatRooms.map((room) => {
        const active = room.slug === activeSlug;
        return (
          <button
            key={room.slug}
            type="button"
            onClick={() => onSelect(room.slug)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "focus-ring flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
              active
                ? "bg-navy text-white"
                : "text-slate hover:bg-mist hover:text-navy",
            )}
          >
            {room.icon && (
              <span className="text-base leading-none">{room.icon}</span>
            )}
            <span className="whitespace-nowrap">{room.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
