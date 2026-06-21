"use client";

import { useState } from "react";
import { X, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface Mutual {
  userId: string;
  name: string;
}

/**
 * "Ask for a warm intro" — pick a shared connection and send them an in-app
 * intro request to introduce you to this member.
 */
export function IntroDialog({
  targetUserId,
  targetName,
  mutuals,
}: {
  targetUserId: string;
  targetName: string;
  mutuals: Mutual[];
}) {
  const [open, setOpen] = useState(false);
  const [via, setVia] = useState(mutuals[0]?.userId ?? "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (mutuals.length === 0) return null;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !via) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/network/intros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viaUserId: via, targetUserId, note: note.trim() }),
      });
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(d.error ?? "Couldn't send your request. Please try again.");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Couldn't send your request. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist"
      >
        <Handshake className="h-4 w-4" />
        Ask for an intro
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-navy/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="my-8 w-full max-w-md rounded-2xl border border-line bg-paper shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
                Ask for a warm intro
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="focus-ring -mr-1 rounded-lg p-1.5 text-muted hover:bg-mist hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {done ? (
              <div className="px-6 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-azure/10 text-azure-deep">
                  <Handshake className="h-6 w-6" />
                </div>
                <p className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
                  Request sent
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">
                  Your shared connection will see it in their intro requests and
                  can make the introduction.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="focus-ring mt-5 rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-600"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 py-5">
                <p className="text-sm leading-relaxed text-slate">
                  Ask a shared connection to introduce you to{" "}
                  <span className="font-medium text-ink">{targetName}</span>.
                </p>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-ink">
                    Who should make the intro?
                  </span>
                  <select
                    value={via}
                    onChange={(e) => setVia(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink focus-ring"
                  >
                    {mutuals.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-xs font-medium text-ink">
                    Add a note{" "}
                    <span className="font-normal text-muted">(optional)</span>
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder={`Why you'd like to meet ${targetName}…`}
                    className={cn(
                      "w-full resize-y rounded-xl border border-line bg-paper px-4 py-2.5 text-sm text-ink placeholder:text-faint focus-ring",
                    )}
                  />
                </label>

                {error ? (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded-full border border-line-strong bg-paper px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-mist"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !via}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-navy px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Sending…" : "Send request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
