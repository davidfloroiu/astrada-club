"use client";

import Link from "next/link";
import { MessageCircle, Heart, Pin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { ForumPost } from "@/lib/forum/store";
import { cn, timeAgo } from "@/lib/utils";

/** A post in the forum board list. Links through to the full thread. */
export function PostCard({ post }: { post: ForumPost }) {
  return (
    <Link
      href={`/forum/${post.id}`}
      className="card-surface group block rounded-2xl p-5 transition-colors hover:border-navy/20"
    >
      <div className="flex items-center gap-3">
        <Avatar name={post.authorName} size="sm" />
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
            {timeAgo(post.createdAt)}
          </p>
        </div>
        {post.isPinned && (
          <Pin className="ml-auto h-4 w-4 shrink-0 text-azure" aria-label="Pinned" />
        )}
      </div>

      <h3 className="mt-3.5 font-display text-lg font-semibold tracking-tight text-ink">
        {post.title}
      </h3>
      {post.content && (
        <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate">
          {post.content}
        </p>
      )}

      <div className="mt-4 flex items-center gap-5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-4 w-4" />
          {post.commentCount} {post.commentCount === 1 ? "reply" : "replies"}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Heart
            className={cn("h-4 w-4", post.likedByMe && "fill-rose-500 text-rose-500")}
          />
          {post.likeCount}
        </span>
        <span className="ml-auto text-azure opacity-0 transition-opacity group-hover:opacity-100">
          Open thread →
        </span>
      </div>
    </Link>
  );
}
