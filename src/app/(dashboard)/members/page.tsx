import { PageHeader } from "@/components/dashboard/PageHeader";
import { MembersDirectory } from "@/components/members/MembersDirectory";

export const metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        subtitle="Sample profiles, shown to illustrate the directory as the founding circle forms. The real directory grows as members join."
      />
      <MembersDirectory />
    </>
  );
}
