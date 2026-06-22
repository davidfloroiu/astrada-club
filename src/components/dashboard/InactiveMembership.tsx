import { AstradaMark } from "@/components/ui/Logo";

/**
 * Shown inside the native app when a signed-in member has no active membership.
 * On the web this case redirects to /join; in the app we can't show a join /
 * purchase path (Apple "reader app" rules), so this is a terminal, no-CTA
 * notice with a sign-out. Membership is managed entirely off-app.
 */
export function InactiveMembership() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 py-16">
      <div className="card-surface w-full max-w-md p-8 text-center">
        <AstradaMark className="mx-auto h-9 w-9" />
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
          Membership inactive
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate">
          Your Astrada membership isn&rsquo;t active right now, so the
          members&rsquo; area is locked. Once it&rsquo;s active again, sign back
          in here to pick up where you left off.
        </p>
        <a
          href="/api/auth/logout"
          className="focus-ring mt-7 inline-flex h-12 w-full items-center justify-center rounded-full bg-navy px-8 text-base font-medium tracking-tight text-white transition-colors hover:bg-navy-600"
        >
          Sign out
        </a>
      </div>
    </main>
  );
}
