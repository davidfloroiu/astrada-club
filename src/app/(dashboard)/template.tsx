/**
 * A template (unlike a layout) re-mounts on every navigation, so the
 * `page-enter` animation in globals.css replays each time you move between
 * pages — giving the in-app navigation a smooth ease-in instead of an abrupt
 * swap. Honors prefers-reduced-motion via the global rule.
 */
export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="page-enter">{children}</div>;
}
