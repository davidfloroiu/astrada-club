import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ApplyForm } from "@/components/marketing/ApplyForm";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to join Astrada's founding circle.",
};

const steps = [
  {
    title: "We read it personally",
    description:
      "Every application is read by hand — no forms forwarded to a void. As a founding club, each one shapes who we become.",
  },
  {
    title: "A short call",
    description:
      "A relaxed conversation to understand what you're building and what you're hoping to find in the circle.",
  },
  {
    title: "Welcome to the founding circle",
    description:
      "If it's a fit, you're one of the first hundred — with a seat at the table as the club takes shape.",
  },
];

export default function ApplyPage() {
  return (
    <section className="pt-28 pb-24 sm:pt-36">
      <Container size="wide">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* Left — persuasive copy */}
          <div className="lg:pt-2">
            <SectionLabel tone="azure">Founding Application</SectionLabel>
            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Apply to the founding circle
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-slate">
              Astrada is a brand-new club forming its founding circle. Tell us
              about you and the company you&apos;re building — the rest is a
              conversation, not a gauntlet.
            </p>

            <div className="mt-10">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-faint">
                What happens next
              </p>
              <ol className="mt-5 space-y-5">
                {steps.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-azure/20 bg-azure/10 font-display text-sm font-semibold text-azure-deep">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <p className="mt-10 text-sm text-muted">
              <span className="text-ink">Free to apply</span>
              <span className="px-2 text-faint">·</span>
              You only pay if accepted
              <span className="px-2 text-faint">·</span>
              Founding rate locked in
            </p>

            <div className="card-surface mt-10 max-w-md p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-azure-deep">
                A founding member
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                The first hundred set the tone for everything that follows — the
                people, the rooms, the standards. Founding members help shape the
                club they&apos;re joining, and keep their founding rate for good.
              </p>
            </div>
          </div>

          {/* Right — the form (focal point) */}
          <div className="lg:sticky lg:top-28">
            <ApplyForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
