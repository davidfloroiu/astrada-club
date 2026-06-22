import { PageHeader } from "@/components/dashboard/PageHeader";
import { Messages } from "@/components/chat/Messages";
import { NewGroupChat } from "@/components/chat/NewGroupChat";
import { NewDirectMessage } from "@/components/chat/NewDirectMessage";

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
        subtitle="Direct messages and private group chats. Message anyone in your network one-on-one, or start a group with a few founders away from the common rooms."
        action={
          <div className="flex items-center gap-2">
            <NewDirectMessage />
            <NewGroupChat />
          </div>
        }
      />
      <Messages initialChannelId={c ?? null} />
    </>
  );
}
