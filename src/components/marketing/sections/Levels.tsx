import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { levels } from "@/lib/data";

export function Levels() {
  return (
    <section className="relative scroll-mt-24 overflow-hidden border-t border-line py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-1/2 -z-10 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(197,202,211,0.5), transparent 65%)",
        }}
      />
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <SectionLabel>Standing</SectionLabel>
            <h2 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Earned, not bought
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate">
              Anyone can call themselves a founder. At Astrada, your standing is
              documented — tied to real revenue, real rounds, real outcomes. Members
              progress through five levels as their companies grow.
            </p>
            <p className="mt-4 leading-relaxed text-slate">
              There&rsquo;s no faking your way up. That&rsquo;s precisely why an
              introduction from a member you&rsquo;ve never met still means something.
            </p>
          </Reveal>

          <div className="flex flex-col gap-3">
            {levels.map((l, i) => (
              <Reveal key={l.level} delay={i * 70}>
                <div className="group flex items-center gap-5 rounded-2xl border border-line bg-paper p-5 shadow-[var(--shadow-card)] transition-colors hover:border-azure/30">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-azure/20 bg-azure/[0.08] font-display text-xl font-semibold text-azure-deep">
                    {l.level}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                        {l.name}
                      </h3>
                      <span className="flex items-center gap-0.5" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, p) => (
                          <span
                            key={p}
                            className={cn(
                              "h-1 w-1 rounded-full",
                              p < l.level ? "bg-azure" : "bg-navy/12",
                            )}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate">
                      {l.requirement}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
