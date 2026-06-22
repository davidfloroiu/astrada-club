import { PageHeader } from "@/components/dashboard/PageHeader";
import { Messages } from "@/components/chat/Messages";
import { NewGroupChat } from "@/components/chat/NewGroupChat";

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
        subtitle="Direct messages and private group chats. Message any member one-on-one, or start a group to talk with a few founders away from the common rooms."
        action={<NewGroupChat />}
      />
      <Messages initialChannelId={c ?? null} />
    </>
  );
}
