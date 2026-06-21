"use client";

import { useState } from "react";
import { PenSquare } from "lucide-react";
import type { ForumPost } from "@/lib/whop/forum";
import { PostCard } from "@/components/forum/PostCard";
import { PostComposer } from "@/components/forum/PostComposer";

/**
 * The community forum board: a "New post" action + the list of posts. New posts
 * are prepended optimistically once the API confirms them.
 */
export function ForumBoard({ initialPosts }: { initialPosts: ForumPost[] }) {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts);
  const [composing, setComposing] = useState(false);

  function handleCreated(post: ForumPost) {
    setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
    setComposing(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          {posts.length > 0
            ? `${posts.length} ${posts.length === 1 ? "post" : "posts"}`
            : "Be the first to post"}
        </p>
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600"
        >
          <PenSquare className="h-4 w-4" />
          New post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="card-surface flex flex-col items-center gap-3 px-6 py-20 text-center">
          <p className="font-display text-lg font-semibold tracking-tight text-ink">
            No posts yet
          </p>
          <p className="max-w-md text-sm leading-relaxed text-slate">
            This is the open community board — share a win, ask the room a
            question, or kick off a discussion every member can join.
          </p>
          <button
            type="button"
            onClick={() => setComposing(true)}
            className="focus-ring mt-2 inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600"
          >
            <PenSquare className="h-4 w-4" />
            Write the first post
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <PostComposer
        open={composing}
        onClose={() => setComposing(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
