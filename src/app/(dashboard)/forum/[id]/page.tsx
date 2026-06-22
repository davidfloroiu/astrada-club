import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { CommentThread } from "@/components/forum/CommentThread";
import { LikeButton } from "@/components/forum/LikeButton";
import { MentionText } from "@/components/forum/MentionText";
import { getSession } from "@/lib/whop/session";
import { getPost, listComments } from "@/lib/forum/store";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const post = session.userId ? await getPost(id, session.userId) : null;
  return { title: post ? post.title : "Post" };
}

export default async function ForumPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session.userId) notFound();

  const [post, comments] = await Promise.all([
    getPost(id, session.userId),
    listComments(id),
  ]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/forum"
        className="inline-flex items-center gap-1.5 text-sm text-slate transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to forum
      </Link>

      <article className="card-surface mt-5 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <Avatar name={post.authorName} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">
              {post.authorName}
              {post.isPosterAdmin && (
                <span className="ml-2 rounded-full bg-azure/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-azure-deep">
                  Team
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted">
              {post.authorUsername ? `@${post.authorUsername} · ` : ""}
              {formatDateTime(post.createdAt)}
            </p>
          </div>
          {post.isPinned && (
            <Pin className="ml-auto h-4 w-4 shrink-0 text-azure" aria-label="Pinned" />
          )}
        </div>

        <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {post.title}
        </h1>
        {post.content && (
          <div className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-slate">
            <MentionText text={post.content} />
          </div>
        )}

        <div className="mt-5">
          <LikeButton
            postId={post.id}
            initialCount={post.likeCount}
            initialLiked={post.likedByMe}
          />
        </div>
      </article>

      <CommentThread postId={post.id} initialComments={comments} />
    </div>
  );
}
