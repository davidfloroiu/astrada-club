import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Badge } from "@/components/ui/Badge";
import { ApplicationForm } from "@/components/marketing/ApplicationForm";

export const metadata = {
  title: "Apply",
  description: "Apply to join the founding circle of Astrada.",
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
            <SectionLabel>{noAccess ? "Membership required" : "Apply to join"}</SectionLabel>
            <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.06] tracking-tight text-ink sm:text-5xl">
              {noAccess ? "You're almost in" : "Apply to join Astrada"}
            </h1>

            {noAccess ? (
              <p className="mt-5 text-lg leading-relaxed text-slate">
                You&rsquo;re signed in, but we couldn&rsquo;t find an active
                membership on your account. If you&rsquo;ve already been approved,
                check your email for your invitation. Otherwise, apply below and
                we&rsquo;ll be in touch.
              </p>
            ) : (
              <p className="mt-5 text-lg leading-relaxed text-slate">
                Astrada is application-only. Tell us about you and what
                you&rsquo;re building — we read every application and invite the
                founders who fit.
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="azure">$49 / month</Badge>
              <Badge tone="azure">$400 / year</Badge>
              <Badge tone="neutral">Cancel anytime</Badge>
            </div>

            <div className="silver-divider my-8 w-24" />

            <p className="text-sm leading-relaxed text-muted">
              No payment now — membership is by review. Approved founders are
              invited to join.
              {!noAccess ? (
                <>
                  {" "}
                  Already a member?{" "}
                  <a
                    href="/api/auth/whop/login?returnTo=/dashboard"
                    className="text-azure hover:text-azure-bright"
                  >
                    Sign in
                  </a>
                  .
                </>
              ) : null}
            </p>
          </div>

          <ApplicationForm />
        </div>
      </Container>
    </section>
  );
}
