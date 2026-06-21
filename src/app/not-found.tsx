import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo, AstradaMark } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="bg-ambient relative flex min-h-screen flex-col">
      <Container size="wide" className="py-6">
        <Logo />
      </Container>
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 pb-24 text-center">
        <div>
          <div className="flex justify-center">
            <AstradaMark className="h-10 w-10 opacity-90" />
          </div>
          <p className="mt-8 font-display text-7xl font-semibold tracking-tight text-navy-gradient">
            404
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink">
            This door is for members only
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-slate">
            The page you&rsquo;re looking for doesn&rsquo;t exist — or it&rsquo;s
            behind a velvet rope you haven&rsquo;t earned yet.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/">Back to home</Button>
            <Button href="/apply" variant="secondary">
              Apply to join
            </Button>
          </div>
          <p className="mt-10 text-sm text-muted">
            Lost?{" "}
            <Link href="/login" className="text-azure hover:text-azure-bright">
              Member login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
