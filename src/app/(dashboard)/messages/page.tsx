import { PageHeader } from "@/components/dashboard/PageHeader";
import { Messages } from "@/components/chat/Messages";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Private one-on-one conversations. You can message any member — open a profile and hit Message, or pick up a conversation here."
      />
      <Messages initialChannelId={c ?? null} />
    </>
  );
}
