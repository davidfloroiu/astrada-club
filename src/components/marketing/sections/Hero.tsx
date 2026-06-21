import { ArrowRight, Sparkles, UtensilsCrossed, MessagesSquare } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AstradaMark } from "@/components/ui/Logo";
import { MembershipCard } from "@/components/marketing/MembershipCard";

const glance = [
  { icon: Sparkles, label: "Curated introductions" },
  { icon: UtensilsCrossed, label: "Intimate founder dinners" },
  { icon: MessagesSquare, label: "A private members' room" },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Mediterranean wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[-6%] -z-10 h-[44rem] w-[44rem] rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(197,202,211,0.55), rgba(14,27,48,0.06) 45%, transparent 70%)",
        }}
      />
      {/* Fine horizon grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(11,27,51,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,27,51,0.04) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 40% 30%, black, transparent 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 40% 30%, black, transparent 78%)",
        }}
      />

      <Container size="wide">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Copy */}
          <div className="max-w-xl">
            <div className="animate-rise">
              <Badge tone="azure" className="px-3 py-1.5">
                <AstradaMark className="h-3.5 w-3.5" />
                The Founding Circle · Now forming
              </Badge>
            </div>

            <h1 className="animate-rise mt-7 text-balance font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl md:text-7xl">
              Find the founders who{" "}
              <span className="text-navy-gradient">get what you&rsquo;re building.</span>
            </h1>

            <p className="animate-rise mt-7 max-w-lg text-pretty text-lg leading-relaxed text-slate">
              Astrada is a private club for founders — and it&rsquo;s brand new.
              We&rsquo;re assembling a small founding circle now: curated
              introductions, intimate dinners, and a room full of people who
              actually understand the work.
            </p>

            <div className="animate-rise mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Button href="/#join" size="lg">
                Apply to join
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/login" variant="secondary" size="lg">
                Member login
              </Button>
            </div>

            <p className="animate-rise mt-5 text-sm text-muted">
              No fake numbers, no borrowed prestige. Just the first hundred
              founders, getting in early.
            </p>

            <div className="animate-rise mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
              {glance.map((g) => {
                const Icon = g.icon;
                return (
                  <span
                    key={g.label}
                    className="inline-flex items-center gap-2 text-sm text-slate"
                  >
                    <Icon className="h-4 w-4 text-azure" />
                    {g.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Membership card visual */}
          <div className="animate-fade relative flex justify-center lg:justify-end">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 m-auto h-72 w-72 rounded-full opacity-70 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(197,202,211,0.55), transparent 70%)",
              }}
            />
            <MembershipCard className="animate-float-slow" />
          </div>
        </div>
      </Container>
    </section>
  );
}
