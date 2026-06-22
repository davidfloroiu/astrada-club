/**
 * @-mention parsing + tokenizing. Client-safe (used by the composer, the
 * highlighter, and the server routes). A username is 2–30 chars of
 * letters/digits/underscore/dot/hyphen, and a mention must start at the
 * beginning or after whitespace (so emails like a@b.com aren't matched).
 */

// '.' and '-' are allowed only in the INTERIOR — a handle must start and end on
// an alphanumeric/underscore. This stops sentence punctuation from being
// swallowed (e.g. "@alice." → "alice", not "alice.") so resolution + highlight
// agree with real Whop usernames.
const USERNAME = "[a-zA-Z0-9_](?:[a-zA-Z0-9_.-]{0,28}[a-zA-Z0-9_])?";
const PARSE_RE = new RegExp(`(?:^|\\s)@(${USERNAME})`, "g");
// Same leading-boundary rule as PARSE_RE (via lookbehind) so the highlighter
// only marks tokens the notify path actually resolves — emails like a@b.com and
// "(@x)" are not highlighted.
const SPLIT_RE = new RegExp(`((?<=^|\\s)@${USERNAME})`, "g");
const TOKEN_RE = new RegExp(`^@${USERNAME}$`);

/** Unique lower-cased usernames mentioned in `text`. */
export function parseMentions(text: string): string[] {
  const out = new Set<string>();
  for (const m of text.matchAll(PARSE_RE)) out.add(m[1].toLowerCase());
  return [...out];
}

/** Split text into segments, keeping @mention tokens as their own segments. */
export function splitMentions(text: string): { text: string; mention: boolean }[] {
  return text
    .split(SPLIT_RE)
    .filter((s) => s.length > 0)
    .map((s) => ({ text: s, mention: TOKEN_RE.test(s) }));
}
