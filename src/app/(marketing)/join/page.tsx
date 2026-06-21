import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { CheckoutPlans } from "@/components/marketing/CheckoutPlans";
import { whop } from "@/lib/whop/config";

export const metadata = {
  title: "Join",
  description: "Become a founding member of Astrada.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const noAccess = reason === "no-access";

  return (
    <section className="pt-32 pb-24 sm:pt-36">
      <Container size="wide">
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <SectionLabel>{noAccess ? "Membership required" : "Join Astrada"}</SectionLabel>
            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-5xl">
              {noAccess
                ? "You're almost in"
                : "Become a founding member"}
            </h1>

            {noAccess ? (
              <p className="mt-5 text-lg leading-relaxed text-slate">
                You&rsquo;re signed in, but we couldn&rsquo;t find an active
                membership on your account. Pick a plan below to join the founding
                circle and unlock the members&rsquo; area.
              </p>
            ) : (
              <p className="mt-5 text-lg leading-relaxed text-slate">
                Join the founding circle — the live community, intimate dinners,
                curated introductions, and the people who actually get what
                you&rsquo;re building.
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="azure">$49 / month</Badge>
              <Badge tone="azure">$400 / year</Badge>
              <Badge tone="neutral">Cancel anytime</Badge>
            </div>

            <div className="silver-divider my-8 w-24" />

            <p className="text-sm leading-relaxed text-muted">
              Prefer the Whop page?{" "}
              <a
                href={whop.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-azure hover:text-azure-bright"
              >
                Join on whop.com/astrada-club
              </a>
              . Already a member?{" "}
              <a
                href="/api/auth/whop/login?returnTo=/dashboard"
                className="text-azure hover:text-azure-bright"
              >
                Sign in
              </a>
              .
            </p>
          </div>

          <CheckoutPlans />
        </div>
      </Container>
    </section>
  );
}
