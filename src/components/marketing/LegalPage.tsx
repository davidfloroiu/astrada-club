import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";

/**
 * Shared shell for the policy pages (Privacy, Terms, Code of Conduct).
 * Renders a consistent header + prose column. Prose typography is applied
 * with Tailwind arbitrary selectors so the page bodies can stay plain JSX.
 */
export function LegalPage({
  label = "Legal",
  title,
  updated,
  intro,
  children,
}: {
  label?: string;
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-32 pb-24 sm:pt-36">
      <Container size="narrow">
        <SectionLabel>{label}</SectionLabel>
        <h1 className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-sm text-muted">Last updated {updated}</p>
        <div className="silver-divider mt-8 w-24" />

        {intro ? (
          <p className="mt-8 text-lg leading-relaxed text-slate">{intro}</p>
        ) : null}

        <div
          className={[
            "mt-10 space-y-5 text-[0.95rem] leading-relaxed text-slate",
            "[&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink",
            "[&_h2:first-child]:mt-0",
            "[&_p]:text-slate",
            "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-platinum",
            "[&_a]:text-navy [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-navy-600",
            "[&_strong]:font-semibold [&_strong]:text-ink",
          ].join(" ")}
        >
          {children}
        </div>
      </Container>
    </section>
  );
}
