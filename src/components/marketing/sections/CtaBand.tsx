import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { AstradaMark } from "@/components/ui/Logo";

export function CtaBand() {
  return (
    <section className="section-navy relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(197,202,211,0.18), transparent 65%)",
        }}
      />
      <Container className="relative py-28 text-center sm:py-36">
        <Reveal>
          <div className="flex justify-center">
            <AstradaMark tone="light" className="h-10 w-10 animate-float-slow" />
          </div>
          <h2 className="mx-auto mt-8 max-w-3xl text-balance font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-6xl">
            The circle is small by design.{" "}
            <span className="text-platinum-gradient">Be one of the first.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-platinum">
            Founding membership is open now. Applications are read personally — the
            sooner yours is in, the earlier you&rsquo;re in the room.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/#join" variant="light" size="lg">
              Apply to join
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              href="/login"
              size="lg"
              className="border border-white/25 bg-transparent text-white hover:bg-white/10"
            >
              Member login
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
