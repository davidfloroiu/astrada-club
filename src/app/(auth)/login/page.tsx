import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AstradaMark } from "@/components/ui/Logo";

export const metadata = { title: "Member Login" };

const errorMessages: Record<string, string> = {
  config: "Sign-in isn't configured yet. Add your Whop OAuth credentials to enable it.",
  denied: "Sign-in was cancelled. Give it another try when you're ready.",
  state: "Your sign-in session expired. Please try again.",
  invalid: "Something went wrong signing you in. Please try again.",
  exchange: "We couldn't complete sign-in with Whop. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const { error, returnTo } = await searchParams;
  const loginHref = `/api/auth/whop/login?returnTo=${encodeURIComponent(
    returnTo ?? "/dashboard",
  )}`;
  const message = error ? errorMessages[error] ?? errorMessages.invalid : null;

  return (
    <div className="card-surface w-full max-w-md p-8">
      <AstradaMark className="h-9 w-9" />
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-ink">
        Welcome back
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate">
        Sign in with your Whop account to enter the members&rsquo; area.
      </p>

      {message && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {message}
        </div>
      )}

      <a
        href={loginHref}
        className="focus-ring mt-7 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-navy px-8 text-base font-medium tracking-tight text-white shadow-[0_10px_24px_-12px_rgba(10,29,58,0.7)] transition-all duration-200 hover:bg-navy-600"
      >
        Sign in with Whop
        <ArrowRight className="h-4 w-4" />
      </a>

      <div className="silver-divider my-7" />

      <p className="text-center text-sm text-muted">
        Not a member yet?{" "}
        <Link href="/join" className="text-azure hover:text-azure-bright">
          Apply to join
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-faint">
        Secured by Whop · OAuth 2.1 with PKCE
      </p>
    </div>
  );
}
