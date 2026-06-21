import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getSession } from "@/lib/whop/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Not signed in → Whop OAuth.
  if (!session.userId) redirect("/login");

  // Signed in but no active membership → join page (on-domain checkout + message).
  if (!session.hasAccess) redirect("/join?reason=no-access");

  return <DashboardShell>{children}</DashboardShell>;
}
