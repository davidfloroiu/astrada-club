import { PageHeader } from "@/components/dashboard/PageHeader";
import { ForumBoard } from "@/components/forum/ForumBoard";
import { getSession } from "@/lib/whop/session";
import { listPosts } from "@/lib/forum/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Forum" };

export default async function ForumPage() {
  const session = await getSession();
  const posts = session.userId ? await listPosts(session.userId) : [];

  return (
    <>
      <PageHeader
        title="Forum"
        subtitle="The open community board — posts every member can see and reply to. Share wins, ask questions, start discussions."
      />
      <ForumBoard initialPosts={posts} />
    </>
  );
}
