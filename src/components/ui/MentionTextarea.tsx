"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface Member {
  userId: string;
  name: string;
  username: string;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
>;

/**
 * Textarea with @-mention autocomplete. Members load lazily on first focus;
 * typing `@` opens a typeahead, and selecting inserts `@username`. Arrow keys
 * navigate, Enter/Tab selects, Esc closes.
 */
export function MentionTextarea({ value, onChange, className, ...props }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState<string | null>(null); // null = closed
  const [start, setStart] = useState(0); // index of the '@'
  const [active, setActive] = useState(0);

  function loadMembers() {
    if (loaded) return;
    setLoaded(true);
    fetch("/api/members")
      .then((r) => (r.ok ? r.json() : { members: [] }))
      .then((d: { members: Member[] }) => setMembers(d.members ?? []))
      .catch(() => {});
  }

  function detect(el: HTMLTextAreaElement) {
    const caret = el.selectionStart ?? 0;
    // Read the live DOM value — the `value` prop is still the pre-keystroke
    // string inside this event (parent setState hasn't re-rendered yet).
    const before = el.value.slice(0, caret);
    const m = before.match(/(?:^|\s)@([a-zA-Z0-9_.-]*)$/);
    if (m) {
      setStart(caret - m[1].length - 1);
      setQuery(m[1].toLowerCase());
      setActive(0);
    } else if (query !== null) {
      setQuery(null);
    }
  }

  const matches =
    query === null
      ? []
      : members
          .filter(
            (mb) =>
              mb.username.toLowerCase().includes(query) ||
              mb.name.toLowerCase().includes(query),
          )
          .slice(0, 6);

  function insert(mb: Member) {
    const el = ref.current;
    const caret = el?.selectionStart ?? value.length;
    const rest = value.slice(caret);
    // Only add a trailing space if the following text doesn't already start with
    // whitespace (avoids a double space when mentioning mid-sentence).
    const sep = /^\s/.test(rest) ? "" : " ";
    const next = `${value.slice(0, start)}@${mb.username}${sep}${rest}`;
    onChange(next);
    setQuery(null);
    const pos = start + mb.username.length + 1 + sep.length;
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query === null || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      insert(matches[active]);
    } else if (e.key === "Escape") {
      setQuery(null);
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          detect(e.target);
        }}
        onKeyDown={onKeyDown}
        onFocus={loadMembers}
        onClick={(e) => detect(e.currentTarget)}
        onBlur={() => setQuery(null)}
        className={className}
        {...props}
      />
      {query !== null && matches.length > 0 && (
        <ul className="absolute left-0 top-full z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-line bg-paper p-1 shadow-[var(--shadow-lift)]">
          {matches.map((mb, i) => (
            <li key={mb.userId}>
              <button
                type="button"
                // onMouseDown (not onClick) so it fires before the textarea blur.
                onMouseDown={(e) => {
                  e.preventDefault();
                  insert(mb);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                  i === active ? "bg-mist" : "hover:bg-mist/60",
                )}
              >
                <Avatar name={mb.name} size="sm" className="h-7 w-7 text-[10px]" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {mb.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    @{mb.username}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
