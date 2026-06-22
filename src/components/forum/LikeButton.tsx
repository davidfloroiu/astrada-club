"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Like toggle for a post. Optimistic — flips immediately, reconciles with the
 * server count, and rolls back on failure.
 */
export function LikeButton({
  postId,
  initialCount,
  initialLiked,
}: {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    const prevLiked = liked;
    const prevCount = count;
    // Optimistic flip.
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));

    try {
      const res = await fetch(`/api/forum/posts/${postId}/like`, { method: "POST" });
      const d = (await res.json().catch(() => ({}))) as {
        liked?: boolean;
        likeCount?: number;
      };
      if (!res.ok || typeof d.likeCount !== "number") {
        setLiked(prevLiked);
        setCount(prevCount);
      } else {
        setLiked(Boolean(d.liked));
        setCount(d.likeCount);
      }
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={liked}
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        liked
          ? "border-like-line bg-like-soft text-like"
          : "border-line text-slate hover:bg-mist hover:text-navy",
      )}
    >
      <Heart className={cn("h-4 w-4", liked && "fill-like text-like")} />
      {count > 0 ? count : ""}
      <span className={count > 0 ? "sr-only" : undefined}>
        {liked ? "Liked" : "Like"}
      </span>
    </button>
  );
}
