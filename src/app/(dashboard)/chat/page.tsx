import { PageHeader } from "@/components/dashboard/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { CommunityChat } from "@/components/chat/CommunityChat";

export const metadata = { title: "Community" };

export default function ChatPage() {
  return (
    <>
      <PageHeader
        title="Community"
        subtitle="The live Astrada chat — in sync with whop.com. Same channel, same people, in real time."
        action={
          <Badge tone="positive">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            Live
          </Badge>
        }
      />
      <CommunityChat />
    </>
  );
}
