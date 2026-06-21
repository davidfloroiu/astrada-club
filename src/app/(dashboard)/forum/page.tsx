import { PageHeader } from "@/components/dashboard/PageHeader";
import { ForumBoard } from "@/components/forum/ForumBoard";
import { listPosts } from "@/lib/whop/forum";

export const dynamic = "force-dynamic";
export const metadata = { title: "Forum" };

export default async function ForumPage() {
  const posts = await listPosts();

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
