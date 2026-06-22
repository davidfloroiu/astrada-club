"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import type { ClubEvent, EventType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";

type Filter = EventType | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "dinner", label: "Dinners" },
  { value: "run", label: "City Runs" },
  { value: "summit", label: "Summit" },
  { value: "workshop", label: "Workshops" },
  { value: "social", label: "Socials" },
];

const TYPE_LABEL: Record<EventType, string> = {
  dinner: "Dinner",
  run: "City Run",
  summit: "Summit",
  workshop: "Workshop",
  social: "Social",
};

function EventCard({
  event,
  reserved,
  onToggle,
}: {
  event: ClubEvent;
  reserved: boolean;
  onToggle: (id: string) => void;
}) {
  const date = new Date(event.date + "T00:00:00");
  const day = date.getDate();
  const month = date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();

  const uncapped = event.capacity <= 0;
  const taken = event.capacity - event.spotsLeft;
  const filledPct = uncapped
    ? 0
    : Math.min(100, Math.max(0, (taken / event.capacity) * 100));
  const lowAvailability = !uncapped && event.spotsLeft <= 3;

  return (
    <div className="card-surface flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
      {/* Date block */}
      <div className="w-16 shrink-0 text-center">
        <div className="font-display text-2xl font-semibold leading-none tracking-tight text-ink">
          {day}
        </div>
        <div className="mt-1.5 text-xs font-medium uppercase tracking-widest text-muted">
          {month}
        </div>
        <div className="mt-1 text-xs text-muted">{event.time}</div>
      </div>

      {/* Main */}
      <div className="min-w-0 flex-1">
        <Badge tone={event.type === "summit" ? "navy" : "neutral"}>
          {TYPE_LABEL[event.type]}
        </Badge>
        <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-ink">
          {event.title}
        </h3>
        <p className="mt-1 text-sm text-slate">
          {event.city} · {event.venue}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Avatar name={event.host} size="sm" />
          <span className="text-sm text-slate">Hosted by {event.host}</span>
        </div>
        {event.description ? (
          <p className="mt-3 line-clamp-2 text-sm text-slate">
            {event.description}
          </p>
        ) : null}
      </div>

      {/* Right / capacity + RSVP */}
      <div className="flex shrink-0 flex-col justify-between gap-4 sm:w-48 sm:items-end sm:text-right">
        <div className="w-full sm:max-w-[12rem]">
          <p
            className={cn(
              "text-xs font-medium",
              lowAvailability ? "text-azure-deep" : "text-muted",
            )}
          >
            {uncapped
              ? "Open capacity"
              : `${event.spotsLeft} of ${event.capacity} spots left`}
          </p>
          {!uncapped && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cloud">
              <div
                className="h-full rounded-full bg-azure"
                style={{ width: `${filledPct}%` }}
              />
            </div>
          )}
        </div>
        <Button
          size="sm"
          variant={reserved ? "secondary" : "primary"}
          onClick={() => onToggle(event.id)}
          className="w-full sm:w-auto"
        >
          {reserved ? (
            <>
              <Check className="h-4 w-4" />
              Reserved
            </>
          ) : (
            "RSVP"
          )}
        </Button>
      </div>
    </div>
  );
}

export function EventsBoard({
  initialEvents,
  canCreate = false,
}: {
  initialEvents: ClubEvent[];
  canCreate?: boolean;
}) {
  const [events, setEvents] = useState<ClubEvent[]>(initialEvents);
  const [type, setType] = useState<Filter>("all");
  const [reserved, setReserved] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  const toggle = (id: string) => {
    setReserved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const visible = sorted.filter((e) => type === "all" || e.type === type);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = type === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setType(f.value)}
              className={cn(
                "focus-ring rounded-full border px-4 py-2 text-sm font-medium tracking-tight transition-colors",
                active
                  ? "border-azure/40 bg-azure/10 text-azure-deep"
                  : "border-line text-slate hover:text-navy",
              )}
            >
              {f.label}
            </button>
          );
        })}
        {canCreate && (
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="ml-auto"
          >
            <Plus className="h-4 w-4" />
            Create event
          </Button>
        )}
      </div>

      {/* Event list */}
      <div className="mt-6 flex flex-col gap-4">
        {visible.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            reserved={reserved.has(event.id)}
            onToggle={toggle}
          />
        ))}

        {visible.length === 0 && (
          <div className="card-surface flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="font-display text-lg font-semibold tracking-tight text-ink">
              {events.length === 0
                ? "No events scheduled yet"
                : "Nothing in this category yet"}
            </p>
            <p className="max-w-md text-sm leading-relaxed text-slate">
              {canCreate
                ? "Be the first to put something on the calendar — a dinner, a run, a room. Members will see it here."
                : "The founding circle is just getting going. The first gatherings will appear here soon."}
            </p>
            {canCreate && events.length === 0 && (
              <Button size="sm" onClick={() => setDialogOpen(true)} className="mt-1">
                <Plus className="h-4 w-4" />
                Create the first event
              </Button>
            )}
          </div>
        )}
      </div>

      {canCreate && (
        <CreateEventDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onCreated={(event) => {
            setEvents((prev) => [...prev, event]);
            setDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
