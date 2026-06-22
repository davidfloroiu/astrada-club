import "server-only";
import webpush from "web-push";
import {
  listForUsers,
  listAllExcept,
  removeEndpoints,
  type PushSubscriptionRecord,
} from "./store";
import {
  listForUsers as listNativeForUsers,
  listAllExcept as listNativeAllExcept,
} from "./native-store";
import { sendNative, isNativePushConfigured } from "./native-send";

/**
 * Sends web-push notifications via the VAPID keys. Everything here is
 * best-effort: a missing config or a failed send never throws to the caller, so
 * notifications can't break the action that triggered them. Dead subscriptions
 * (404/410) are pruned automatically.
 */

export interface PushPayload {
  title: string;
  body: string;
  /** Where clicking the notification should take the member (defaults to /dashboard). */
  url?: string;
  /** Collapses notifications that share a tag (e.g. one per conversation). */
  tag?: string;
}

let configured = false;
function ensureConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contact@astradaclub.com",
      publicKey,
      privateKey,
    );
    configured = true;
  }
  return true;
}

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
  );
}

// Cap concurrent outbound sends so a large broadcast can't exhaust sockets or
// blow the function's time budget — we send in fixed-size waves.
const BATCH_SIZE = 50;

async function deliver(
  subs: PushSubscriptionRecord[],
  payload: PushPayload,
): Promise<void> {
  if (subs.length === 0 || !ensureConfigured()) return;
  const body = JSON.stringify(payload);
  const dead: string[] = [];

  for (let i = 0; i < subs.length; i += BATCH_SIZE) {
    const wave = subs.slice(i, i + BATCH_SIZE);
    await Promise.all(
      wave.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            body,
          );
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          // 404/410 = the subscription is gone; collect to prune in bulk.
          if (status === 404 || status === 410) dead.push(sub.endpoint);
          else console.error("[push] send failed", status ?? err);
        }
      }),
    );
  }

  if (dead.length > 0) await removeEndpoints(dead).catch(() => {});
}

// Each transport (web-push + native APNs/FCM) runs independently and best-effort,
// so a missing config or a failure on one never blocks the other.

async function webToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!isPushConfigured()) return;
  try {
    await deliver(await listForUsers(userIds), payload);
  } catch (err) {
    console.error("[push] web pushToUsers failed", err);
  }
}

async function nativeToUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!isNativePushConfigured()) return;
  try {
    await sendNative(await listNativeForUsers(userIds), payload);
  } catch (err) {
    console.error("[push] native pushToUsers failed", err);
  }
}

/** Notify specific members across every device they've registered (web + app). */
export async function pushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<void> {
  if (userIds.length === 0) return;
  await Promise.all([webToUsers(userIds, payload), nativeToUsers(userIds, payload)]);
}

/** Notify every subscribed member except the one who triggered it (web + app). */
export async function pushBroadcast(
  exceptUserId: string,
  payload: PushPayload,
): Promise<void> {
  const tasks: Promise<void>[] = [];
  if (isPushConfigured()) {
    tasks.push(
      deliver(await listAllExcept(exceptUserId), payload).catch((err) =>
        console.error("[push] web pushBroadcast failed", err),
      ),
    );
  }
  if (isNativePushConfigured()) {
    tasks.push(
      sendNative(await listNativeAllExcept(exceptUserId), payload).catch((err) =>
        console.error("[push] native pushBroadcast failed", err),
      ),
    );
  }
  await Promise.all(tasks);
}
