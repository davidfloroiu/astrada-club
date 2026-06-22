"use client";

import { useEffect } from "react";

/**
 * Registers the device for native push when running inside the Astrada app, and
 * forwards the FCM/APNs token to the server (/api/push/native). Completely inert
 * on the web: the Capacitor modules are dynamically imported *inside* the effect,
 * so SSR and the browser bundle never load them, and everything bails unless
 * `isNativePlatform()` is true. Web visitors keep using the VAPID web-push toggle.
 *
 * Mounted in the dashboard layout, so it only runs for signed-in members.
 */
export function NativePushRegistrar() {
  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (cancelled || !Capacitor.isNativePlatform()) return;

      const { PushNotifications } = await import("@capacitor/push-notifications");
      try {
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive !== "granted" || cancelled) return;

        const platform = Capacitor.getPlatform() === "ios" ? "ios" : "android";

        // Listeners must be attached before register() so we don't miss the token.
        const onToken = await PushNotifications.addListener(
          "registration",
          (token) => {
            void fetch("/api/push/native", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: token.value, platform }),
            }).catch(() => {});
          },
        );
        const onError = await PushNotifications.addListener(
          "registrationError",
          (err) => console.error("[native-push] registration error", err),
        );
        // Deep-link to the right page when a notification is tapped.
        const onTap = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            const url = action.notification?.data?.url;
            if (typeof url === "string" && url.startsWith("/")) {
              window.location.assign(url);
            }
          },
        );

        await PushNotifications.register();

        cleanup = () => {
          void onToken.remove();
          void onError.remove();
          void onTap.remove();
        };
      } catch (err) {
        console.error("[native-push] setup failed", err);
      }
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
