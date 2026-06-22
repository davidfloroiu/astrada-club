import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Astrada native shell (Capacitor).
 *
 * This is a *remote-URL* app: the native iOS/Android shell loads the live
 * Next.js site (astradaclub.com) inside a WebView and layers native
 * capabilities on top — push notifications, splash screen, status-bar styling,
 * biometric login, etc. We deliberately do NOT statically export the site
 * (it's server-rendered: server components, API routes, iron-session, Postgres),
 * so `webDir` only holds an offline fallback screen.
 *
 * App Store posture: members only ever *sign in* here. There is no purchase or
 * signup path in the app — payment happens entirely on the web — so we stay
 * within Apple's "reader app" allowance (guideline 3.1.1). The appended
 * user-agent marker lets the web app hide any join/checkout/pricing affordances
 * when it detects it's running inside the app.
 */
const config: CapacitorConfig = {
  appId: "com.astradaclub.app",
  appName: "Astrada",
  // Only used as an offline fallback — the app normally loads server.url.
  webDir: "native/shell",
  server: {
    url: "https://astradaclub.com",
    cleartext: false,
    // Keep these hosts inside the app's WebView (Whop OAuth + embeds) rather
    // than kicking out to the system browser.
    allowNavigation: [
      "astradaclub.com",
      "*.astradaclub.com",
      "whop.com",
      "*.whop.com",
    ],
  },
  ios: {
    // "never" lets the WebView go truly edge-to-edge so the page background
    // fills the status-bar and home-indicator safe areas. The app owns its own
    // safe-area spacing in CSS via env(safe-area-inset-*) (paired with
    // viewport-fit=cover). "always" made WKWebView reserve the bottom inset and
    // exposed the native scroll-view background (a beige band) under the home
    // indicator.
    contentInset: "never",
    backgroundColor: "#edebe5",
    // Let the WebView's own pull-to-refresh / scroll feel native.
    scrollEnabled: true,
  },
  android: {
    backgroundColor: "#edebe5",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#edebe5",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    PushNotifications: {
      // Show banners/badges/sounds even while the app is foregrounded.
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
  // Marker the web app reads to render the members-only (no-checkout) experience.
  appendUserAgent: "AstradaApp/1.0",
};

export default config;
