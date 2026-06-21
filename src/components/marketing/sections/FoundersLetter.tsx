import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { AstradaMark } from "@/components/ui/Logo";

export function FoundersLetter() {
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Container size="narrow">
        <Reveal>
          <div className="flex justify-center">
            <SectionLabel>Why we&rsquo;re building this</SectionLabel>
          </div>

          <figure className="mt-10 text-center">
            <AstradaMark className="mx-auto h-9 w-9" />
            <blockquote className="mt-8 text-balance font-display text-3xl font-medium leading-[1.25] tracking-tight text-ink sm:text-4xl">
              &ldquo;We started Astrada because the best conversations we ever had as
              founders happened off the record, with people who&rsquo;d actually been
              there. We wanted a room full of that — and we&rsquo;d rather build it
              honestly, one real member at a time, than fake a crowd.&rdquo;
            </blockquote>
            <figcaption className="mt-8">
              <div className="silver-divider mx-auto mb-6 w-16" />
              <p className="font-medium text-ink">The founders of Astrada</p>
              <p className="text-sm text-muted">Building the founding circle, 2026</p>
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}
