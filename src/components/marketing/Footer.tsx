import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

const columns = [
  {
    title: "Club",
    links: [
      { href: "/#club", label: "The Club" },
      { href: "/#benefits", label: "Membership" },
      { href: "/#who", label: "Who it's for" },
      { href: "/#join", label: "Apply" },
    ],
  },
  {
    title: "Members",
    links: [
      { href: "/login", label: "Member login" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/events", label: "Events" },
      { href: "/deals", label: "Perks" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: "/#join", label: "Apply" },
      { href: "mailto:hello@astradaclub.com", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-mist/60">
      <Container size="wide" className="py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-slate">
              A private community for founders, being built from the ground up.
              Membership is by application.
            </p>
            <div className="silver-divider mt-6 w-24" />
            <p className="mt-4 text-xs text-muted">Forming the founding circle now.</p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate transition-colors hover:text-navy"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Astrada Club. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-navy">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-navy">
              Terms
            </Link>
            <Link
              href="/code-of-conduct"
              className="transition-colors hover:text-navy"
            >
              Code of Conduct
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
