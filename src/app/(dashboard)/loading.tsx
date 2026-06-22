/**
 * Instant loading skeleton for member pages. Without this, navigating to a
 * server-rendered (dynamic) page left the previous page frozen during the
 * round-trip — felt like lag. This renders immediately on navigation, so the
 * tab switch is perceived as instant.
 */
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-mist" />
        <div className="h-9 w-3/5 rounded-lg bg-mist" />
        <div className="h-4 w-11/12 max-w-md rounded bg-mist/70" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-28 rounded-2xl bg-mist/70" />
        <div className="h-28 rounded-2xl bg-mist/70" />
      </div>
      <div className="h-44 rounded-2xl bg-mist/60" />
    </div>
  );
}
