import { Check } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { CheckoutPlans } from "@/components/marketing/CheckoutPlans";

const included = [
  "The live community chat",
  "Member forums & discussions",
  "Member-only events",
  "Founder announcements",
  "The member directory",
  "Member perks as we line them up",
  "Founding-member status",
  "A direct line to the founders",
];

export function Membership() {
  return (
    <section id="join" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <Container size="wide">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <SectionLabel>Join</SectionLabel>
          </div>
          <h2 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Become a founding member
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate">
            Join the founding circle for{" "}
            <span className="font-medium text-ink">$49/month</span> or{" "}
            <span className="font-medium text-ink">$400/year</span>. Checkout is
            secure and happens right here.
          </p>
        </Reveal>

        <div className="mt-16 grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal>
            <Badge tone="azure">Founding Circle</Badge>
            <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">
              What&rsquo;s included
            </h3>
            <ul className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-azure" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="silver-divider my-7 w-24" />
            <p className="text-sm leading-relaxed text-slate">
              Membership runs on Whop. After joining, sign in with Whop to enter
              the members&rsquo; area — your community, all in one place.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <CheckoutPlans />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
