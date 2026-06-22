import { PageHeader } from "@/components/dashboard/PageHeader";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";
import { getSession } from "@/lib/whop/session";
import { memberMap, type DirectoryMember } from "@/lib/members/directory";
import { listIncoming, listIntros } from "@/lib/network/store";
import { listNotifications } from "@/lib/notifications/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Notifications" };

/**
 * Activity inbox (Instagram-style) — incoming connection requests + warm-intro
 * asks, with inline actions. The header bell links here; your full connections
 * list lives on /network.
 */
export default async function NotificationsPage() {
  const session = await getSession();
  const userId = session.userId ?? "";

  const [incomingIds, intros, notifications, map] = await Promise.all([
    userId ? listIncoming(userId) : Promise.resolve([]),
    userId ? listIntros(userId) : Promise.resolve([]),
    userId ? listNotifications(userId) : Promise.resolve([]),
    memberMap(),
  ]);

  const enrich = (id: string): DirectoryMember =>
    map.get(id) ?? { userId: id, name: "Member", username: "", isAdmin: false };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Mentions, connection requests, and intro asks from across the network."
      />
      <NotificationsClient
        initialNotifications={notifications}
        initialIncoming={incomingIds.map(enrich)}
        initialIntros={intros.map((i) => ({
          id: i.id,
          note: i.note,
          createdAt: i.createdAt,
          from: enrich(i.fromId),
          target: enrich(i.targetId),
        }))}
      />
    </>
  );
}
