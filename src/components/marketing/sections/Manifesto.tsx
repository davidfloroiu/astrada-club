import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";

const principles = [
  {
    k: "01",
    title: "Built, not aspiring",
    body: "Every member runs a real company with real traction. No spectators, no gurus, no one selling you a course.",
  },
  {
    k: "02",
    title: "Off the record",
    body: "What's said at an Astrada table stays there. That's the only way founders talk honestly about what's actually hard.",
  },
  {
    k: "03",
    title: "Honest from day one",
    body: "We're new and we'll say so. We'd rather earn a small, real circle than inflate numbers we don't have.",
  },
];

export function Manifesto() {
  return (
    <section id="club" className="scroll-mt-24 py-24 sm:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionLabel>The Club</SectionLabel>
            <h2 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              For founders who go the extra mile — and the people who get why.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-slate">
              Building a company is the loneliest kind of hard. The people around
              you can sympathize, but few can actually relate. Astrada exists to
              be the room where they can.
            </p>
            <p className="mt-4 leading-relaxed text-slate">
              We&rsquo;re not a networking app or a paid mastermind, and we&rsquo;re
              not pretending to be something we&rsquo;re not. We&rsquo;re building a
              vetted circle of founders from the ground up — and the people who join
              now will shape what it becomes.
            </p>
          </Reveal>

          <div className="flex flex-col gap-4 self-center">
            {principles.map((p, i) => (
              <Reveal key={p.k} delay={i * 90}>
                <div className="card-surface flex gap-5 p-6 sm:p-7">
                  <span className="font-display text-3xl font-semibold text-azure/70">
                    {p.k}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 leading-relaxed text-slate">{p.body}</p>
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
