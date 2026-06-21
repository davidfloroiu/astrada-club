"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ClubEvent, EventType } from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus-ring hover:border-navy/20";
const labelClass = "mb-1.5 block text-xs font-medium text-ink";

const TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "dinner", label: "Dinner" },
  { value: "run", label: "City Run" },
  { value: "summit", label: "Summit" },
  { value: "workshop", label: "Workshop" },
  { value: "social", label: "Social" },
];

export function CreateEventDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (event: ClubEvent) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const data = new FormData(e.currentTarget);
    const payload = {
      title: String(data.get("title") ?? ""),
      type: String(data.get("type") ?? ""),
      date: String(data.get("date") ?? ""),
      time: String(data.get("time") ?? ""),
      city: String(data.get("city") ?? ""),
      venue: String(data.get("venue") ?? ""),
      host: String(data.get("host") ?? ""),
      capacity: String(data.get("capacity") ?? ""),
      description: String(data.get("description") ?? ""),
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await res.json().catch(() => ({}))) as {
        event?: ClubEvent;
        error?: string;
      };
      if (!res.ok || !d.event) {
        setError(d.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      onCreated(d.event);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-line bg-paper shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            Create an event
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring -mr-1 rounded-lg p-1.5 text-muted hover:bg-mist hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid gap-4">
            <label className="block">
              <span className={labelClass}>Title</span>
              <input
                name="title"
                required
                placeholder="Founding Dinner — San Francisco"
                className={fieldClass}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Type</span>
                <select name="type" defaultValue="dinner" className={fieldClass}>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>
                  Capacity{" "}
                  <span className="font-normal text-muted">(0 = no limit)</span>
                </span>
                <input
                  name="capacity"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Date</span>
                <input name="date" type="date" required className={fieldClass} />
              </label>
              <label className="block">
                <span className={labelClass}>Time</span>
                <input
                  name="time"
                  required
                  placeholder="7:00 PM"
                  className={fieldClass}
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>City</span>
                <input
                  name="city"
                  required
                  placeholder="San Francisco"
                  className={fieldClass}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Venue</span>
                <input
                  name="venue"
                  required
                  placeholder="Private room, Nob Hill"
                  className={fieldClass}
                />
              </label>
            </div>

            <label className="block">
              <span className={labelClass}>
                Host{" "}
                <span className="font-normal text-muted">
                  (defaults to you)
                </span>
              </span>
              <input
                name="host"
                placeholder="Who's hosting"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                name="description"
                rows={3}
                placeholder="What the evening is about, who it's for, anything members should know."
                className={cn(fieldClass, "resize-y")}
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-full border border-line-strong bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring inline-flex items-center justify-center rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
