"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-faint focus-ring transition-colors";
const labelClass = "block text-sm font-medium text-slate mb-1.5";

const stageOptions = [
  "Pre-seed / Idea",
  "Seed",
  "Series A",
  "Series B+",
  "Bootstrapped / Profitable",
  "Exited founder",
] as const;

const revenueOptions = [
  "Pre-revenue",
  "<$250k",
  "$250k–$1M",
  "$1M–$10M",
  "$10M+",
] as const;

const nextSteps = [
  "We read your application personally",
  "A short call to say hello",
  "Welcome to the founding circle — one of the first hundred",
];

interface FormState {
  name: string;
  email: string;
  company: string;
  role: string;
  website: string;
  stage: string;
  revenue: string;
  city: string;
  building: string;
  why: string;
  referral: string;
}

const initialState: FormState = {
  name: "",
  email: "",
  company: "",
  role: "",
  website: "",
  stage: "",
  revenue: "",
  city: "",
  building: "",
  why: "",
  referral: "",
};

const requiredFields: Array<keyof FormState> = [
  "name",
  "email",
  "company",
  "role",
  "stage",
  "city",
  "building",
];

/** Azure asterisk marking a required label. */
function Req() {
  return <span className="text-azure"> *</span>;
}

export function ApplyForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const missing = requiredFields.some((field) => form[field].trim() === "");
    if (missing) {
      setError("Please fill in all required fields before submitting.");
      return;
    }
    setError(null);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="card-surface p-7 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-azure/20 bg-azure/10">
          <CheckCircle2 className="h-8 w-8 text-azure" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
          Application received
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate">
          Thank you, {form.name.trim()}. You&apos;re in line for the founding
          circle — we&apos;ve sent a confirmation to{" "}
          <span className="text-ink">{form.email.trim()}</span>.
        </p>

        <div className="mt-8 rounded-2xl border border-line bg-mist/60 p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            What happens next
          </p>
          <ol className="mt-4 space-y-3.5">
            {nextSteps.map((step, i) => (
              <li
                key={step}
                className="flex items-start gap-3 text-sm text-slate"
              >
                <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-azure/20 bg-azure/10 text-xs font-semibold text-azure-deep">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-8">
          <Button href="/" size="lg" className="w-full">
            Back to home
          </Button>
          <p className="mt-3 text-xs text-faint">
            Free to apply · You only pay if accepted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card-surface p-7 sm:p-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Full name
            <Req />
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={update}
            placeholder="Jordan Reyes"
            className={inputClass}
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email
            <Req />
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={update}
            placeholder="you@company.com"
            className={inputClass}
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="company" className={labelClass}>
            Company
            <Req />
          </label>
          <input
            id="company"
            name="company"
            type="text"
            value={form.company}
            onChange={update}
            placeholder="Acme, Inc."
            className={inputClass}
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>
            Your role
            <Req />
          </label>
          <input
            id="role"
            name="role"
            type="text"
            value={form.role}
            onChange={update}
            placeholder="Co-founder & CEO"
            className={inputClass}
            autoComplete="organization-title"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="website" className={labelClass}>
            Company website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={form.website}
            onChange={update}
            placeholder="https://"
            className={inputClass}
            autoComplete="url"
          />
        </div>

        <div>
          <label htmlFor="stage" className={labelClass}>
            Company stage
            <Req />
          </label>
          <select
            id="stage"
            name="stage"
            value={form.stage}
            onChange={update}
            className={inputClass}
          >
            <option value="" disabled>
              Select a stage
            </option>
            {stageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="revenue" className={labelClass}>
            Annual revenue
          </label>
          <select
            id="revenue"
            name="revenue"
            value={form.revenue}
            onChange={update}
            className={inputClass}
          >
            <option value="" disabled>
              Select a range
            </option>
            {revenueOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="city" className={labelClass}>
            City
            <Req />
          </label>
          <input
            id="city"
            name="city"
            type="text"
            value={form.city}
            onChange={update}
            placeholder="San Francisco"
            className={inputClass}
            autoComplete="address-level2"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="building" className={labelClass}>
            What are you building?
            <Req />
          </label>
          <textarea
            id="building"
            name="building"
            value={form.building}
            onChange={update}
            rows={3}
            placeholder="A sentence or two on the company and the problem you're solving."
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="why" className={labelClass}>
            Why Astrada?
          </label>
          <textarea
            id="why"
            name="why"
            value={form.why}
            onChange={update}
            rows={3}
            placeholder="What are you hoping to find in the founding circle?"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="referral" className={labelClass}>
            Referred by a member?
          </label>
          <input
            id="referral"
            name="referral"
            type="text"
            value={form.referral}
            onChange={update}
            placeholder="Their name (optional)"
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-azure/20 bg-azure/[0.08] px-4 py-3 text-sm text-azure-deep"
        >
          {error}
        </p>
      )}

      <div className="mt-7">
        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              Submitting…
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            </>
          ) : (
            <>
              Submit application
              <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-faint">
          Free to apply · You only pay if accepted · Founding rate locked in.
        </p>
      </div>
    </form>
  );
}
