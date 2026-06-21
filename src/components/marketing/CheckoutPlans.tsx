"use client";

import { useState } from "react";
import { WhopCheckoutEmbed } from "@whop/checkout/react";
import { plans, type PlanKey } from "@/lib/whop/config";
import { cn } from "@/lib/utils";

/**
 * On-domain Whop checkout for the two membership plans. Visitors pick a plan and
 * complete payment without leaving the site (embedded via @whop/checkout/react).
 */
export function CheckoutPlans() {
  const [active, setActive] = useState<PlanKey>("annual");
  const plan = plans.find((p) => p.key === active) ?? plans[0];

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/login?returnTo=/dashboard`
      : undefined;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {plans.map((p) => {
          const selected = p.key === active;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setActive(p.key)}
              aria-pressed={selected}
              className={cn(
                "focus-ring rounded-2xl border p-5 text-left transition-all",
                selected
                  ? "border-azure/50 bg-azure/[0.06] shadow-[var(--shadow-card)]"
                  : "border-line bg-paper hover:border-navy/20",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{p.name}</span>
                {p.featured && (
                  <span className="rounded-full bg-navy px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                    Best value
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-display text-3xl font-semibold text-ink">
                  {p.price}
                </span>
                <span className="text-sm text-muted">{p.interval}</span>
              </div>
              <p className="mt-1 text-xs text-slate">{p.note}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-paper shadow-[var(--shadow-card)]">
        <WhopCheckoutEmbed
          key={plan.planId}
          planId={plan.planId}
          theme="light"
          returnUrl={returnUrl}
          fallback={
            <div className="flex h-72 items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-azure" />
            </div>
          }
        />
      </div>

      <p className="mt-3 text-center text-xs text-faint">
        Secure checkout by Whop · Cancel anytime
      </p>
    </div>
  );
}
