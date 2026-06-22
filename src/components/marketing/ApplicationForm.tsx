"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-[0.95rem] text-ink placeholder:text-faint transition-colors focus-ring hover:border-navy/20";
const labelClass = "mb-1.5 block text-sm font-medium text-ink";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {hint ? <span className="ml-1.5 font-normal text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

/**
 * Membership application. Astrada is application-only — visitors apply here and
 * we review before inviting them to join. Submissions are emailed to the team
 * via /api/apply (Resend); no payment happens on the public site.
 */
export function ApplicationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [sentName, setSentName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      company: String(data.get("company") ?? ""),
      link: String(data.get("link") ?? ""),
      building: String(data.get("building") ?? ""),
      stage: String(data.get("stage") ?? ""),
      why: String(data.get("why") ?? ""),
    };

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setSentName(payload.name.trim().split(" ")[0] ?? "");
      setStatus("success");
      form.reset();
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start rounded-2xl border border-line bg-paper p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white">
          <Check className="h-5 w-5" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
          Application received{sentName ? `, ${sentName}` : ""}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-slate">
          We read every application personally. If it&rsquo;s a fit, we&rsquo;ll
          reach out by email with your invitation to join the founding circle.
          Thanks for your interest in Astrada.
        </p>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line bg-paper p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Jane Founder"
              className={fieldClass}
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="jane@company.com"
              className={fieldClass}
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company / startup">
            <input
              name="company"
              type="text"
              required
              placeholder="Company name"
              className={fieldClass}
            />
          </Field>
          <Field label="Website or LinkedIn" hint="optional">
            <input
              name="link"
              type="text"
              placeholder="https://"
              className={fieldClass}
            />
          </Field>
        </div>

        <Field label="What are you building?">
          <textarea
            name="building"
            required
            rows={3}
            placeholder="A sentence or two on the company and what you do."
            className={cn(fieldClass, "resize-y")}
          />
        </Field>

        <Field label="Stage / traction" hint="optional">
          <input
            name="stage"
            type="text"
            placeholder="e.g. $40k MRR · raised a seed · pre-launch"
            className={fieldClass}
          />
        </Field>

        <Field label="Why Astrada?" hint="optional">
          <textarea
            name="why"
            rows={3}
            placeholder="What are you hoping to get from the room?"
            className={cn(fieldClass, "resize-y")}
          />
        </Field>
      </div>

      {status === "error" && error ? (
        <p className="mt-4 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 text-[0.95rem] font-medium text-white shadow-[0_10px_24px_-12px_rgba(10,29,58,0.7)] transition-all duration-200 hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60 h-12"
      >
        {submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Sending&hellip;
          </>
        ) : (
          <>
            Submit application
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="mt-4 text-center text-xs leading-relaxed text-muted">
        Membership is by application and review. There&rsquo;s no payment now —
        approved founders are invited to join.
      </p>
    </form>
  );
}
