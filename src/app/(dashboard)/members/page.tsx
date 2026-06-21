import { PageHeader } from "@/components/dashboard/PageHeader";
import { MembersDirectory } from "@/components/members/MembersDirectory";

export const metadata = { title: "Members" };

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        subtitle="The member directory fills in as the founding circle joins."
      />
      <MembersDirectory />
    </>
  );
}
