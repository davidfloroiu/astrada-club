import { PageHeader } from "@/components/dashboard/PageHeader";
import { NetworkClient } from "@/components/network/NetworkClient";
import { getSession } from "@/lib/whop/session";
import { memberMap, type DirectoryMember } from "@/lib/members/directory";
import { getConnectedIds, listIncoming, listIntros } from "@/lib/network/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Network" };

export default async function NetworkPage() {
  const session = await getSession();
  const userId = session.userId ?? "";

  const [connectedIds, incomingIds, intros, map] = await Promise.all([
    userId ? getConnectedIds(userId) : Promise.resolve([]),
    userId ? listIncoming(userId) : Promise.resolve([]),
    userId ? listIntros(userId) : Promise.resolve([]),
    memberMap(),
  ]);

  const enrich = (id: string): DirectoryMember =>
    map.get(id) ?? { userId: id, name: "Member", username: "", isAdmin: false };

  return (
    <>
      <PageHeader
        title="Network"
        subtitle="Your connections, requests, and intro asks — your corner of the Astrada network."
      />
      <NetworkClient
        initialIncoming={incomingIds.map(enrich)}
        initialConnections={connectedIds.map(enrich)}
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
