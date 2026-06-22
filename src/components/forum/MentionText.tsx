import { Fragment } from "react";
import { splitMentions } from "@/lib/mentions";

/**
 * Renders post/comment text with @mentions highlighted. Server-safe (no hooks),
 * so it works in the post-detail server component and the client comment list.
 * Relies on a `whitespace-pre-wrap` parent to preserve newlines.
 */
export function MentionText({ text }: { text: string }) {
  const parts = splitMentions(text);
  return (
    <>
      {parts.map((p, i) =>
        p.mention ? (
          <span key={i} className="font-semibold text-azure">
            {p.text}
          </span>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        ),
      )}
    </>
  );
}
