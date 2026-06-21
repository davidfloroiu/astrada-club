import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ChatRoomShell } from "@/components/chat/ChatRoomShell";

export const metadata = { title: "Chat" };

export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Chat"
        subtitle="Live chat in sync with whop.com. Jump into the room for your industry — or hang out in General."
        action={
          <Badge tone="positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            Live
          </Badge>
        }
      />
      <ChatRoomShell />
    </>
  );
}
