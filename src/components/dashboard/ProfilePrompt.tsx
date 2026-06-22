"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, UserCircle } from "lucide-react";
import {
  profileCompletion,
  EMPTY_PROFILE,
  type MemberProfile,
} from "@/lib/profile/fields";

const DISMISS_KEY = "astrada-profile-prompt-dismissed";

/**
 * Soft onboarding nudge on the dashboard: a dismissible "complete your profile"
 * card with a live completion meter. Hides itself when the profile is complete
 * or the member has dismissed it. Never blocks the app.
 */
export function ProfilePrompt() {
  const [completion, setCompletion] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(true); // assume hidden until we know

  useEffect(() => {
    const wasDismissed = (() => {
      try {
        return localStorage.getItem(DISMISS_KEY) === "1";
      } catch {
        return false;
      }
    })();
    let active = true;
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : { profile: EMPTY_PROFILE }))
      .then((d: { profile?: MemberProfile }) => {
        if (!active) return;
        const pct = profileCompletion(d.profile ?? EMPTY_PROFILE);
        setCompletion(pct);
        setDismissed(wasDismissed || pct >= 100);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (completion === null || dismissed || completion >= 100) return null;

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div className="card-surface relative overflow-hidden p-5">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="focus-ring absolute right-3 top-3 rounded-lg p-1.5 text-faint hover:bg-mist hover:text-navy"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-azure/10 text-azure-deep">
          <UserCircle className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-sm font-semibold text-ink">Complete your profile</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate">
            Add your industry, what you&rsquo;re building, and who you want to
            meet — it helps the community connect you with the right people.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full bg-azure transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate">
              {completion}%
            </span>
          </div>
          <Link
            href="/profile/edit"
            className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-600"
          >
            Complete profile
          </Link>
        </div>
      </div>
    </div>
  );
}
