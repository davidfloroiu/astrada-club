"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/#club", label: "The Club" },
  { href: "/#benefits", label: "Membership" },
  { href: "/#who", label: "Who it's for" },
  { href: "/#join", label: "Apply" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <Container size="wide">
        <div className="flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-slate transition-colors hover:text-navy"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Button href="/dashboard" size="sm">
                Enter dashboard
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  Member login
                </Button>
                <Button href="/#join" size="sm">
                  Apply
                </Button>
              </>
            )}
          </div>

          <button
            className="focus-ring -mr-2 rounded-md p-2 text-navy md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-canvas/95 backdrop-blur-xl md:hidden">
          <Container size="wide">
            <nav className="flex flex-col gap-1 py-4">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-3 text-base text-slate transition-colors hover:bg-mist hover:text-navy"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2">
                {user ? (
                  <Button href="/dashboard" size="md">
                    Enter dashboard
                  </Button>
                ) : (
                  <>
                    <Button href="/login" variant="secondary" size="md">
                      Member login
                    </Button>
                    <Button href="/#join" size="md">
                      Apply to join
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
