import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { InactiveMembership } from "@/components/dashboard/InactiveMembership";
import { NativePushRegistrar } from "@/components/pwa/NativePushRegistrar";
import { getSession } from "@/lib/whop/session";
import { isNativeApp } from "@/lib/native";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Not signed in → Whop OAuth.
  if (!session.userId) redirect("/login");

  // Signed in but no active membership. On the web → join page. In the native
  // app we can't surface a join/purchase path, and /join would bounce back here
  // via the proxy, so show a terminal notice instead.
  if (!session.hasAccess) {
    if (await isNativeApp()) return <InactiveMembership />;
    redirect("/join?reason=no-access");
  }

  return (
    <>
      <NativePushRegistrar />
      <DashboardShell>{children}</DashboardShell>
    </>
  );
}
