# Astrada native apps (iOS + Android)

The native apps are a thin **[Capacitor](https://capacitorjs.com) shell** around the
live site. The shell loads `https://astradaclub.com` in a native WebView and adds
native capabilities (splash screen, status-bar styling, and — next phase — push
notifications, biometric login, etc.). There is **one codebase**: the Next.js app.
We deploy the web app to Vercel as usual; the native apps pick up changes the next
time they load, with no rebuild or resubmission required for ordinary updates.

Why a remote-URL shell and not a static export? The site is server-rendered
(server components, API routes, iron-session, Postgres), so it can't be exported
to static files. The shell points at the deployed origin instead — see
[`capacitor.config.ts`](capacitor.config.ts).

## Members-only posture (App Store compliance)

In the app, members **only ever sign in** — there is no join/apply/pricing/purchase
path. Payment happens entirely off-app (on Whop). This keeps us within Apple's
"reader app" allowance (guideline 3.1.1).

How it's enforced: the shell appends `AstradaApp/1.0` to its WebView user-agent
(`appendUserAgent` in the config). The web app detects that:

- [`src/proxy.ts`](src/proxy.ts) redirects app requests for `/`, `/join`, and
  `/apply` straight to `/dashboard`.
- [`src/lib/native.ts`](src/lib/native.ts) (`isNativeApp()`) lets server components
  branch — e.g. the login page hides "Apply to join", and a lapsed member sees a
  no-CTA "membership inactive" notice instead of the join page.

Keep the marker string in sync between `capacitor.config.ts`, `src/proxy.ts`, and
`src/lib/native.ts` if it ever changes.

## Prerequisites

- **iOS:** macOS, Xcode, CocoaPods (`brew install cocoapods`), and an Apple
  Developer account for signing + submission.
- **Android:** [Android Studio](https://developer.android.com/studio) (provides the
  Android SDK + an emulator) and a Google Play Developer account for submission.

## Day-to-day

```bash
# Apply config / plugin / icon changes into the native projects.
# (NOT needed for ordinary web changes — those just deploy to Vercel.)
npm run cap:sync

# Open the native IDEs:
npm run cap:ios       # → Xcode
npm run cap:android   # → Android Studio

# Build + launch on an iOS simulator from the CLI:
npm run cap:run:ios
```

### Run on iOS (device or simulator)

1. `npm run cap:ios` to open the project in Xcode.
2. Select the **App** target → **Signing & Capabilities** → set your Apple
   Developer **Team** (Xcode manages the provisioning profile automatically).
3. Pick a simulator or a connected device and press **Run** (▶).

### Regenerating the icon + splash

Source images live in [`assets/`](assets) and are generated from the brand mark by
[`native/gen-assets.mjs`](native/gen-assets.mjs). To regenerate everything after a
brand tweak:

```bash
npm run cap:assets   # rebuilds sources, regenerates all platform variants
```

(The icon is the platinum mark on navy; the light splash is the navy mark on cream.)

## Submitting to the stores

**iOS** — In Xcode: set the Team, bump the build/version, then **Product → Archive**
→ **Distribute App → App Store Connect**. Create the listing in
[App Store Connect](https://appstoreconnect.apple.com). Present it as a members-only
app: reviewers will sign in, so provide a demo member account in App Review notes.

**Android** — In Android Studio: **Build → Generate Signed Bundle (AAB)**, then
upload it in the [Google Play Console](https://play.google.com/console).

Bundle id / application id: **`com.astradaclub.app`** · display name: **Astrada**.

## Native push notifications

The code is fully wired and ships **inert** until you add the credentials below —
nothing breaks in the meantime. In the app, [`NativePushRegistrar`](src/components/pwa/NativePushRegistrar.tsx)
registers the device and sends its token to [`/api/push/native`](src/app/api/push/native/route.ts);
the existing `pushToUsers` / `pushBroadcast` helpers then fan out to **both** the
web-push subscriptions (PWA) **and** native device tokens. iOS tokens are delivered
straight over **APNs** (`apns2`), Android over **FCM** (`firebase-admin`) — see
[`src/lib/push/native-send.ts`](src/lib/push/native-send.ts). No Firebase SDK is
added to the iOS app.

Two independent transports — set up either or both:

### iOS (APNs) — uses your Apple Developer account, no Firebase

1. **APNs key:** [Apple Developer](https://developer.apple.com/account) → Certificates,
   IDs & Profiles → **Keys** → **+** → enable **Apple Push Notifications service (APNs)**
   → create, and **download the `.p8`** (you can only download it once). Note the
   **Key ID** and your **Team ID** (top-right of the portal).
2. **App capability:** confirm the App ID `com.astradaclub.app` has **Push
   Notifications** enabled. In Xcode (`npm run cap:ios`): **App** target → **Signing &
   Capabilities** → **+ Capability** → add **Push Notifications**, and **Background
   Modes** → check **Remote notifications**.
3. **Vercel env** (Project → Settings → Environment Variables):
   - `APNS_KEY` — the full contents of the `.p8` file (paste as-is, including the
     `-----BEGIN PRIVATE KEY-----` lines)
   - `APNS_KEY_ID` — the key's ID
   - `APNS_TEAM_ID` — your Apple Team ID
   - `APNS_BUNDLE_ID` — `com.astradaclub.app`
   - `APNS_HOST` — `production`. **Gotcha:** a build run from Xcode onto a device gets
     a *sandbox* token — set this to `development` while testing a debug build, and
     back to `production` for TestFlight / App Store builds.

### Android (FCM) — needs a Firebase project

1. **Firebase app:** [Firebase console](https://console.firebase.google.com) → create
   (or reuse) a project → **Add app → Android**, package name `com.astradaclub.app` →
   download **`google-services.json`** into `android/app/`.
2. **Gradle wiring** (Capacitor doesn't add this automatically):
   - `android/build.gradle` → `dependencies { classpath 'com.google.gms:google-services:4.4.2' }`
   - `android/app/build.gradle` → at the bottom: `apply plugin: 'com.google.gms.google-services'`
3. **Server key:** Firebase console → **Project settings → Service accounts →
   Generate new private key** → download the JSON. Set Vercel env
   `FIREBASE_SERVICE_ACCOUNT` to that JSON (raw, or base64 if you prefer a single line).

### Verifying

After setting the env vars, redeploy, open the app, sign in, and accept the system
notification prompt (the app requests it automatically on the dashboard). A new row
lands in the `native_push_tokens` table. Triggering any notification (new forum post,
event, connection request) — or the **Send a test** button — should now reach the
device. Dead tokens are pruned automatically on send.
