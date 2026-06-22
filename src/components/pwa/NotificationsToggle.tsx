"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const out = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

/** Upsert the browser subscription on the server (idempotent, keyed by endpoint). */
async function postSubscription(sub: PushSubscription): Promise<boolean> {
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON() }),
  });
  return res.ok;
}

type State =
  | "loading"
  | "unconfigured" // no VAPID key set on the server yet
  | "unsupported"
  | "default" // can enable
  | "subscribed"
  | "denied"
  | "working";

/**
 * Opt-in toggle for browser push notifications (new forum posts, events, and
 * connection/intro requests). Renders nothing until push is configured + the
 * browser supports it, so it never shows a dead control.
 */
export function NotificationsToggle() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let cancelled = false;

    async function reconcile() {
      if (!VAPID_PUBLIC_KEY) return setState("unconfigured");
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        return setState("unsupported");
      }
      // Re-read permission each time, so unblocking/blocking in browser
      // settings is reflected when the tab regains focus.
      if (Notification.permission === "denied") return setState("denied");
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (cancelled) return;
        if (sub) {
          // Re-POST so the DB always has a row for an existing browser
          // subscription (idempotent upsert) — keeps server + browser in sync.
          await postSubscription(sub).catch(() => {});
          if (!cancelled) setState("subscribed");
        } else {
          setState("default");
        }
      } catch {
        if (!cancelled) setState("default");
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") void reconcile();
    };
    // Defer so the initial setState isn't synchronous within the effect body.
    void Promise.resolve().then(reconcile);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function enable() {
    if (!VAPID_PUBLIC_KEY) return;
    setState("working");
    let sub: PushSubscription | undefined;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "default");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      if (await postSubscription(sub)) {
        setState("subscribed");
        return;
      }
      // Server didn't record it — tear down the browser subscription so we
      // never leave an orphan that silently receives nothing.
      await sub.unsubscribe().catch(() => {});
      setState("default");
    } catch {
      if (sub) await sub.unsubscribe().catch(() => {});
      setState("default");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setState("default");
    } catch {
      setState("subscribed");
    }
  }

  // Hide entirely when push can't be offered.
  if (state === "loading" || state === "unconfigured" || state === "unsupported") {
    return null;
  }

  const subscribed = state === "subscribed";
  const working = state === "working";

  return (
    <div className="card-surface flex items-center gap-4 p-5">
      <span
        className={
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl " +
          (subscribed ? "bg-azure/10 text-azure-deep" : "bg-mist text-slate")
        }
      >
        {subscribed ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Notifications</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          {state === "denied"
            ? "Notifications are blocked in your browser settings — enable them there to turn this on."
            : subscribed
              ? "On — you'll get alerts for new posts, events, and connection requests."
              : "Get alerts for new forum posts, events, and connection requests."}
        </p>
      </div>

      {state !== "denied" &&
        (subscribed ? (
          <button
            type="button"
            onClick={disable}
            disabled={working}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-slate transition-colors hover:bg-mist hover:text-navy disabled:opacity-60"
          >
            <Check className="h-4 w-4 text-azure" />
            On
          </button>
        ) : (
          <button
            type="button"
            onClick={enable}
            disabled={working}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-600 disabled:opacity-60"
          >
            <Bell className="h-4 w-4" />
            {working ? "…" : "Turn on"}
          </button>
        ))}
    </div>
  );
}
