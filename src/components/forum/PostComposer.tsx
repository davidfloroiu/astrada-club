"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ForumPost } from "@/lib/forum/store";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-faint transition-colors focus-ring hover:border-navy/20";
const labelClass = "mb-1.5 block text-xs font-medium text-ink";

/**
 * Modal composer for a new community post. Posts to /api/forum/posts, which
 * attributes the post to the signed-in member.
 */
export function PostComposer({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (post: ForumPost) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    const data = new FormData(e.currentTarget);
    const payload = {
      title: String(data.get("title") ?? ""),
      content: String(data.get("content") ?? ""),
    };

    try {
      const res = await fetch("/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = (await res.json().catch(() => ({}))) as {
        post?: ForumPost;
        error?: string;
      };
      if (!res.ok || !d.post) {
        setError(d.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      onCreated(d.post);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-line bg-paper shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
            New post
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="focus-ring -mr-1 rounded-lg p-1.5 text-muted hover:bg-mist hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          <div className="grid gap-4">
            <label className="block">
              <span className={labelClass}>Title</span>
              <input
                name="title"
                required
                maxLength={140}
                autoFocus
                placeholder="What do you want to share or ask?"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={labelClass}>Message</span>
              <textarea
                name="content"
                required
                rows={6}
                maxLength={5000}
                placeholder="Write your post. Markdown is supported."
                className={cn(fieldClass, "resize-y")}
              />
            </label>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-danger-line bg-danger-soft px-4 py-2.5 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-full border border-line-strong bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring inline-flex items-center justify-center rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Posting…" : "Publish post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
