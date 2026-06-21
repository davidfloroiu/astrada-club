import {
  Users,
  UtensilsCrossed,
  MessagesSquare,
  Handshake,
  Tags,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { benefits } from "@/lib/data";

const icons: Record<string, LucideIcon> = {
  Users,
  UtensilsCrossed,
  MessagesSquare,
  Handshake,
  Tags,
};

export function Benefits() {
  return (
    <section id="benefits" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <SectionLabel>Membership</SectionLabel>
          </div>
          <h2 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            What membership is being built around
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate">
            The foundations of the club. Some are live for founding members today;
            others we&rsquo;re building as the circle grows — and we&rsquo;ll always
            be clear about which is which.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = icons[b.icon] ?? Users;
            return (
              <Reveal key={b.title} delay={(i % 3) * 80}>
                <article className="card-surface group h-full p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-azure/15 bg-azure/[0.08] text-azure transition-colors group-hover:bg-azure/[0.14]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-ink">
                    {b.title}
                  </h3>
                  <p className="mt-2.5 leading-relaxed text-slate">{b.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
