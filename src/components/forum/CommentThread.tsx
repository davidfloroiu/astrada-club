"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { ForumComment } from "@/lib/forum/store";
import { timeAgo } from "@/lib/utils";

/**
 * Comments on a post + a reply composer. Replies post to
 * /api/forum/posts/[id]/comments and append on success.
 */
export function CommentThread({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: ForumComment[];
}) {
  const [comments, setComments] = useState<ForumComment[]>(initialComments);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = value.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const d = (await res.json().catch(() => ({}))) as {
        comment?: ForumComment;
        error?: string;
      };
      if (!res.ok || !d.comment) {
        setError(d.error ?? "Couldn't post your reply. Please try again.");
        setSubmitting(false);
        return;
      }
      setComments((prev) => [...prev, d.comment!]);
      setValue("");
      setSubmitting(false);
    } catch {
      setError("Couldn't post your reply. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
        {comments.length} {comments.length === 1 ? "Reply" : "Replies"}
      </h2>

      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          maxLength={5000}
          placeholder="Write a reply…"
          className="w-full resize-y rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink placeholder:text-faint transition-colors focus-ring hover:border-navy/20"
        />
        {error ? (
          <p className="mt-2 rounded-xl border border-danger-line bg-danger-soft px-4 py-2.5 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="mt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting || !value.trim()}
            className="focus-ring inline-flex items-center justify-center rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Posting…" : "Reply"}
          </button>
        </div>
      </form>

      {comments.length > 0 && (
        <ul className="mt-6 grid gap-4">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Avatar name={c.authorName} size="sm" />
              <div className="min-w-0 flex-1 rounded-2xl border border-line bg-paper px-4 py-3">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink">
                    {c.authorName}
                  </p>
                  {c.isPosterAdmin && (
                    <span className="rounded-full bg-azure/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-azure-deep">
                      Team
                    </span>
                  )}
                  <span className="ml-auto shrink-0 text-xs text-muted">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate">
                  {c.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
