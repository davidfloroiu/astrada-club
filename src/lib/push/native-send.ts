import "server-only";
import { ApnsClient, Notification, Host, Errors } from "apns2";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { removeTokens, type NativeTokenRecord } from "./native-store";
import type { PushPayload } from "./send";

/**
 * Native (app) push delivery. iOS device tokens go out over APNs (apns2), Android
 * over FCM (firebase-admin). Like the web-push sender, everything here is
 * best-effort and config-gated: with no credentials set it's a silent no-op, so
 * notifications never break the action that triggered them. Dead tokens are pruned.
 *
 * Required env (each transport is independent — set either, both, or neither):
 *   iOS  — APNS_KEY (.p8 contents), APNS_KEY_ID, APNS_TEAM_ID,
 *          APNS_BUNDLE_ID (default com.astradaclub.app), APNS_HOST (production|development)
 *   Android — FIREBASE_SERVICE_ACCOUNT (service-account JSON, raw or base64)
 */

const BUNDLE_ID = process.env.APNS_BUNDLE_ID || "com.astradaclub.app";
const FCM_BATCH = 500; // sendEachForMulticast hard limit

function apnsEnvReady(): boolean {
  return Boolean(
    process.env.APNS_KEY && process.env.APNS_KEY_ID && process.env.APNS_TEAM_ID,
  );
}
function fcmEnvReady(): boolean {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
}

export function isNativePushConfigured(): boolean {
  return apnsEnvReady() || fcmEnvReady();
}

// ---- APNs (iOS) -----------------------------------------------------------
let apns: ApnsClient | null = null;
let apnsTried = false;
function getApns(): ApnsClient | null {
  if (apnsTried) return apns;
  apnsTried = true;
  if (!apnsEnvReady()) return null;
  // Env vars store newlines escaped as "\n"; restore them for the PEM key.
  const signingKey = (process.env.APNS_KEY as string).replace(/\\n/g, "\n");
  apns = new ApnsClient({
    team: process.env.APNS_TEAM_ID as string,
    keyId: process.env.APNS_KEY_ID as string,
    signingKey,
    defaultTopic: BUNDLE_ID,
    host: process.env.APNS_HOST === "development" ? Host.development : Host.production,
  });
  return apns;
}

const APNS_DEAD = new Set<string>([
  Errors.badDeviceToken,
  Errors.unregistered,
  Errors.deviceTokenNotForTopic,
]);

async function sendApns(
  records: NativeTokenRecord[],
  payload: PushPayload,
  dead: string[],
): Promise<void> {
  const client = getApns();
  if (!client || records.length === 0) return;
  const notes = records.map(
    (r) =>
      new Notification(r.token, {
        alert: { title: payload.title, body: payload.body },
        sound: "default",
        threadId: payload.tag,
        collapseId: payload.tag,
        data: payload.url ? { url: payload.url } : {},
      }),
  );
  const results = await client.sendMany(notes);
  results.forEach((res, i) => {
    if ("error" in res) {
      const reason = res.error.reason;
      if (APNS_DEAD.has(reason)) dead.push(records[i].token);
      else console.error("[native-push] apns send failed", reason);
    }
  });
}

// ---- FCM (Android) --------------------------------------------------------
let fcmApp: App | null = null;
let fcmTried = false;
function getFcmApp(): App | null {
  if (fcmTried) return fcmApp;
  fcmTried = true;
  if (!fcmEnvReady()) return null;
  try {
    const raw = (process.env.FIREBASE_SERVICE_ACCOUNT as string).trim();
    const json = raw.startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const serviceAccount = JSON.parse(json);
    fcmApp = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert(serviceAccount) });
  } catch (err) {
    console.error("[native-push] bad FIREBASE_SERVICE_ACCOUNT", err);
    fcmApp = null;
  }
  return fcmApp;
}

const FCM_DEAD = new Set<string>([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

async function sendFcm(
  records: NativeTokenRecord[],
  payload: PushPayload,
  dead: string[],
): Promise<void> {
  const app = getFcmApp();
  if (!app || records.length === 0) return;
  const messaging = getMessaging(app);
  for (let i = 0; i < records.length; i += FCM_BATCH) {
    const slice = records.slice(i, i + FCM_BATCH);
    const resp = await messaging.sendEachForMulticast({
      tokens: slice.map((r) => r.token),
      notification: { title: payload.title, body: payload.body },
      data: payload.url ? { url: payload.url } : {},
      android: {
        collapseKey: payload.tag,
        notification: { tag: payload.tag },
      },
    });
    resp.responses.forEach((r, j) => {
      if (!r.success) {
        const code = r.error?.code ?? "";
        if (FCM_DEAD.has(code)) dead.push(slice[j].token);
        else console.error("[native-push] fcm send failed", code || r.error);
      }
    });
  }
}

/** Deliver to native device tokens, routing each by platform. Prunes dead tokens. */
export async function sendNative(
  records: NativeTokenRecord[],
  payload: PushPayload,
): Promise<void> {
  if (records.length === 0) return;
  const dead: string[] = [];
  const ios = records.filter((r) => r.platform === "ios");
  const android = records.filter((r) => r.platform === "android");
  await Promise.all([
    sendApns(ios, payload, dead).catch((err) =>
      console.error("[native-push] apns batch failed", err),
    ),
    sendFcm(android, payload, dead).catch((err) =>
      console.error("[native-push] fcm batch failed", err),
    ),
  ]);
  if (dead.length > 0) await removeTokens(dead).catch(() => {});
}
