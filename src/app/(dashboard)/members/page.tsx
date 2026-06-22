import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  MembersDirectory,
  type DirectoryEntry,
} from "@/components/members/MembersDirectory";
import { getSession } from "@/lib/whop/session";
import { listMembers } from "@/lib/members/directory";
import { getStatuses } from "@/lib/network/store";
import { getProfiles } from "@/lib/profile/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Members" };

export default async function MembersPage() {
  const session = await getSession();
  const all = await listMembers();
  const others = all.filter((m) => m.userId !== session.userId);

  const ids = others.map((m) => m.userId);
  const [statuses, profiles] = await Promise.all([
    session.userId ? getStatuses(session.userId, ids) : Promise.resolve(new Map()),
    getProfiles(ids),
  ]);

  const members: DirectoryEntry[] = others.map((m) => {
    const p = profiles.get(m.userId);
    return {
      ...m,
      status: statuses.get(m.userId) ?? "none",
      industry: p?.industry ?? "",
      location: [p?.city, p?.country].filter(Boolean).join(", "),
    };
  });

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
