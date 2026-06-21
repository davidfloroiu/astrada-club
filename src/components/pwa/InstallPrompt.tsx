"use client";

import { useEffect, useState } from "react";
import { Share, Plus, Download, X } from "lucide-react";

const DISMISS_KEY = "astrada-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "hidden" | "ios" | "install";

/**
 * A tasteful, dismissible prompt to install Astrada to the home screen.
 *
 * - Android / desktop Chrome: captures `beforeinstallprompt` and offers a real
 *   Install button.
 * - iOS Safari (which has no install event): shows the manual Share → Add to
 *   Home Screen instructions.
 * Hidden when already installed (standalone) or previously dismissed.
 */
export function InstallPrompt() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari exposes this non-standard flag when launched from home screen.
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const ios =
      /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    if (ios) {
      // One-time client capability detection; safe to set on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode("ios");
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setMode("install");
    };
    const onInstalled = () => setMode("hidden");
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setMode("hidden");
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setMode("hidden");
  }

  if (mode === "hidden") return null;
  const isIOS = mode === "ios";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-line bg-paper p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon-192.png" alt="" className="h-10 w-10" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink">Install Astrada</p>
            {isIOS ? (
              <p className="mt-1 text-xs leading-relaxed text-slate">
                Tap{" "}
                <Share className="inline h-3.5 w-3.5 -translate-y-px text-azure" />{" "}
                <span className="font-medium text-ink">Share</span>, then{" "}
                <span className="font-medium text-ink">
                  Add to Home Screen{" "}
                  <Plus className="inline h-3.5 w-3.5 -translate-y-px" />
                </span>{" "}
                to use Astrada like an app.
              </p>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-slate">
                Add Astrada to your home screen for a full-screen, app-like
                experience — no app store needed.
              </p>
            )}

            {!isIOS && (
              <button
                type="button"
                onClick={install}
                className="focus-ring mt-3 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-navy-600"
              >
                <Download className="h-4 w-4" />
                Install app
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="focus-ring -mr-1 -mt-1 rounded-lg p-1.5 text-faint hover:bg-mist hover:text-navy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
