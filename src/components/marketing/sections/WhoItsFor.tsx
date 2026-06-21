import { Rocket, TrendingUp, Anchor, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { archetypes } from "@/lib/data";

const icons: Record<string, LucideIcon> = { Rocket, TrendingUp, Anchor };

export function WhoItsFor() {
  return (
    <section id="who" className="section-navy relative scroll-mt-24 overflow-hidden">
      {/* soft platinum horizon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      <Container className="py-24 sm:py-32">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <SectionLabel tone="light">Who it&rsquo;s for</SectionLabel>
          </div>
          <h2 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl">
            Built for founders in the thick of it
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-platinum">
            We&rsquo;re industry-agnostic but not stage-agnostic. Astrada is for
            people who&rsquo;ve already built something real — not aspiring founders,
            students, or anyone looking to sell to the room.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {archetypes.map((a, i) => {
            const Icon = icons[a.icon] ?? Rocket;
            return (
              <Reveal key={a.title} delay={i * 90}>
                <article className="card-glass h-full p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">
                    {a.title}
                  </h3>
                  <p className="mt-2.5 leading-relaxed text-platinum">
                    {a.description}
                  </p>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-12 text-center">
          <p className="text-sm text-platinum-deep">
            Not sure if you&rsquo;re a fit? Join the founding circle and see for
            yourself — you can cancel anytime.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
