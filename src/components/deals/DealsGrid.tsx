"use client";

import { useState } from "react";
import { Hourglass, Check } from "lucide-react";
import { perks } from "@/lib/data";
import type { Perk } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const categories = ["All", ...Array.from(new Set(perks.map((p) => p.category))).sort()];

export function DealsGrid() {
  const [category, setCategory] = useState<string>("All");
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const filtered: Perk[] =
    category === "All" ? perks : perks.filter((p) => p.category === category);

  const toggleNotify = (id: string) => {
    setNotified((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "focus-ring rounded-full border px-4 py-2 text-sm transition-colors",
                active
                  ? "border-azure/40 bg-azure/10 text-azure-deep"
                  : "border-line text-slate hover:text-navy",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <p className="mb-5 text-sm text-faint">
        {filtered.length} {filtered.length === 1 ? "perk" : "perks"} in the works
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const isNotified = notified.has(p.id);
          return (
            <div key={p.id} className="card-surface flex flex-col p-6">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-azure/15 bg-azure/10 font-display text-xl text-azure-deep">
                  {p.monogram}
                </div>
                <Badge tone="neutral">{p.category}</Badge>
              </div>

              <div className="mt-3">
                <Badge tone="azure">
                  <Hourglass className="h-3.5 w-3.5" />
                  {p.status}
                </Badge>
              </div>

              <h3 className="mt-3 font-display text-xl tracking-tight text-ink">
                {p.title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                {p.description}
              </p>

              <Button
                size="sm"
                variant="secondary"
                className="mt-5 w-full"
                onClick={() => toggleNotify(p.id)}
              >
                {isNotified ? (
                  <>
                    <Check className="h-4 w-4" />
                    On the list
                  </>
                ) : (
                  "Notify me when live"
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
