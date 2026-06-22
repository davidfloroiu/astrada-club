"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  INDUSTRIES,
  STAGES,
  LOOKING_FOR,
  type MemberProfile,
} from "@/lib/profile/fields";

const fieldClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus-ring hover:border-navy/20";
const labelClass = "mb-1.5 block text-xs font-medium text-ink";

export function ProfileForm({ initial }: { initial: MemberProfile }) {
  const router = useRouter();
  const [p, setP] = useState<MemberProfile>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof MemberProfile>(k: K, v: MemberProfile[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }
  function toggleLooking(t: string) {
    setP((prev) => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(t)
        ? prev.lookingFor.filter((x) => x !== t)
        : [...prev.lookingFor, t],
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Couldn't save. Please try again.");
        setSaving(false);
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Couldn't save. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-line bg-paper p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Industry</span>
            <select
              value={p.industry}
              onChange={(e) => set("industry", e.target.value)}
              className={fieldClass}
            >
              <option value="">Select an industry</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Company stage</span>
            <select
              value={p.stage}
              onChange={(e) => set("stage", e.target.value)}
              className={fieldClass}
            >
              <option value="">Select a stage</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Role / title</span>
            <input
              value={p.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Founder & CEO"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Company</span>
            <input
              value={p.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Acme Inc."
              className={fieldClass}
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Country</span>
            <input
              value={p.country}
              onChange={(e) => set("country", e.target.value)}
              placeholder="United States"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>City</span>
            <input
              value={p.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="San Francisco"
              className={fieldClass}
            />
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>What are you building?</span>
          <textarea
            value={p.building}
            onChange={(e) => set("building", e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="A sentence or two on your company and what you do."
            className={cn(fieldClass, "resize-y")}
          />
        </label>

        <div>
          <span className={labelClass}>What are you open to?</span>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR.map((t) => {
              const on = p.lookingFor.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggleLooking(t)}
                  aria-pressed={on}
                  className={cn(
                    "focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    on
                      ? "border-azure bg-azure/10 text-azure-deep"
                      : "border-line text-slate hover:bg-mist hover:text-navy",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className={labelClass}>Who do you want to meet?</span>
          <input
            value={p.seeking}
            onChange={(e) => set("seeking", e.target.value)}
            maxLength={200}
            placeholder="e.g. fintech operators, seed investors, design partners"
            className={fieldClass}
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>
              LinkedIn <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              value={p.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
              placeholder="linkedin.com/in/you"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>
              Website <span className="font-normal text-muted">(optional)</span>
            </span>
            <input
              value={p.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="yourcompany.com"
              className={fieldClass}
            />
          </label>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="focus-ring mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 text-[0.95rem] font-medium text-white shadow-[0_10px_24px_-12px_rgba(10,29,58,0.7)] transition-all duration-200 hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Saving&hellip;
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Save profile
          </>
        )}
      </button>
    </form>
  );
}
