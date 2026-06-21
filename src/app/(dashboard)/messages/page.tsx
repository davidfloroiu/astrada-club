import { PageHeader } from "@/components/dashboard/PageHeader";
import { Messages } from "@/components/chat/Messages";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Private one-on-one conversations with other members. Pick someone to start a new chat, or pick up where you left off."
      />
      <Messages />
    </>
  );
}
