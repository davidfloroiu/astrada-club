import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  MembersDirectory,
  type DirectoryEntry,
} from "@/components/members/MembersDirectory";
import { getSession } from "@/lib/whop/session";
import { listMembers } from "@/lib/members/directory";
import { getStatuses } from "@/lib/network/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Members" };

export default async function MembersPage() {
  const session = await getSession();
  const all = await listMembers();
  const others = all.filter((m) => m.userId !== session.userId);

  const statuses = session.userId
    ? await getStatuses(
        session.userId,
        others.map((m) => m.userId),
      )
    : new Map();

  const members: DirectoryEntry[] = others.map((m) => ({
    ...m,
    status: statuses.get(m.userId) ?? "none",
  }));

  return (
    <>
      <PageHeader
        title="Members"
        subtitle="The people of Astrada. Connect, see who you both know, and ask for a warm introduction."
      />
      <MembersDirectory members={members} />
    </>
  );
}
