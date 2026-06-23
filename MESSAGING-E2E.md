# In-house E2E messaging — architecture & roadmap

Goal: replace the Whop DM/group-chat embed with our **own** end-to-end encrypted
messaging, using the **Signal Protocol** (X3DH + Double Ratchet; Sender Keys for
groups; Sesame for multi-device). Community chat can stay on Whop for now; this
doc is about **private DMs + group chats**.

> Decisions (2026-06-22): **real E2E, native-bundled** · realtime = **Ably**
> (managed, ciphertext-only relay).
> ⚠️ **REVISED by the architecture review (see end of doc):** pivot OFF AGPL
> `libsignal` to a permissively-licensed lib (vodozemac / MLS) that still gives
> Signal's actual crypto; isolate the messaging WebView as a first-class
> requirement; and cut the MVP to **1:1 single-device + verification** (full
> scope — groups, multi-device, backup — was the top risk to ever shipping).

## The core constraint (why "native-bundled")
E2E only defeats a malicious/compromised **operator** if the client code can't be
silently swapped by that operator. Our app today is a Capacitor **remote-URL
shell** loading live `astradaclub.com` — so any JS we serve could exfiltrate keys
before encryption. Therefore the **messaging client + crypto must ship inside the
signed native binary**, with private keys in the OS keystore, never exposed to
remotely-loaded JS.

Chosen shape: **hybrid app.** The rest of the app stays a remote-URL shell
(instant web deploys); the **messaging surface is a native-bundled module** —
local web UI assets shipped in the binary + a **Capacitor crypto plugin** wrapping
`libsignal`, with keys in iOS Keychain (Secure Enclave where possible) / Android
Keystore. The WebView UI calls the plugin to encrypt/decrypt; **private keys never
enter the JS context.** Consequence: messaging-client changes require an App Store
release (not a web deploy). Browser web users get **no E2E DMs** (or a clearly
labeled, weaker fallback) — that's the honest cost of real E2E.

## Components
- **Crypto (client, native):** `@signalapp/libsignal-client` via a custom
  Capacitor plugin (iOS `LibSignalClient` Swift pkg; Android `libsignal-client`
  AAR). Handles identity keys, X3DH, Double Ratchet, Sender Keys. Keys in
  Keychain/Keystore. *Open task: confirm/extend a Capacitor binding; likely
  build+maintain our own thin plugin.*
- **Key directory (our server — Vercel + Postgres):** stores only **public**
  material — per-device identity keys, signed prekeys, one-time prekeys, device
  registry. Serves prekey bundles so a sender can start a session offline.
- **Ciphertext relay + store:** Ably delivers live ciphertext envelopes; Postgres
  stores encrypted envelopes for offline/missed-message sync. **Server sees only
  ciphertext + public keys** — never plaintext, never private keys.
- **Realtime:** Ably channels per conversation; **token auth** minted by a Vercel
  function that checks conversation membership. Behind a `RealtimeTransport`
  interface for future swap.
- **Backup:** opaque encrypted history blob; key derived from a user passphrase
  (Argon2id). Server can't read it; restore on a new/relinked device.

## Data model (sketch — all server-side rows hold only public/ciphertext data)
- `e2e_devices(user_id, device_id, identity_pubkey, registration_id, created_at)`
- `e2e_signed_prekeys(device_id, key_id, pubkey, signature, ...)`
- `e2e_one_time_prekeys(device_id, key_id, pubkey, used_at)`  — replenished
- `conversations(id, type[dm|group], created_by, ...)` + `conversation_members(...)`
- `message_envelopes(id, conversation_id, sender_device, recipient_device,
  ciphertext, sent_at, delivered_at)`  — per-recipient-device fan-out
- `e2e_backups(user_id, blob, kdf_params, updated_at)`

## Phased roadmap (each phase independently shippable)
0. **Foundations** — Ably account + token-auth endpoint; the Capacitor libsignal
   plugin spike (prove encrypt/decrypt round-trip on iOS+Android with keys in the
   keystore); finalize schema. *Highest-risk spike → do first.*
1. **Identity & keys** — device identity gen, prekey upload, prekey-bundle serving,
   device registry. (Backend + plugin key-gen.)
2. **1:1 DMs, single device** — X3DH + Double Ratchet send/receive; Ably live +
   Postgres offline sync; native-bundled chat UI (our design).
3. **Groups** — Sender Keys: per-group sender key distributed pairwise, message
   encrypted once; membership add/remove → rekey.
4. **Multi-device** — Sesame device linking (QR provisioning); per-device sessions;
   sender fans out to every recipient device.
5. **Encrypted backup & verification** — passphrase-derived backup, restore flow,
   safety-number verification UI, key-change warnings.
6. **Hardening & audit** — rate limits, abuse handling, **external security audit**
   before marketing as "Signal-grade"; cut over from the Whop DM embed.

## Prerequisites / risks (need owner input or carry real risk)
- **Ably account** (you create; I wire token auth). Free tier fine to start.
- **App Store export compliance** — E2E triggers `ITSAppUsesNonExemptEncryption`
  + possibly a self-classification report (standard for messaging apps).
- **libsignal-in-Capacitor** is the biggest unknown — Phase 0 spike must de-risk it
  before committing to the rest.
- **Multi-device + backup** are where E2E projects fail; treat as their own hard
  phases.
- Don't market as "Signal-grade" until the **audit** in Phase 6.

## Architecture review (2026-06-22) — three changes before this is buildable
A 4-lens adversarial review (threat-model · libsignal-feasibility · multi-device/backup
· infra-product; 16 risks, web-verified) flagged that the locked decisions need
revisiting. Headlines:

**1. The library choice is wrong/hazardous — pivot off libsignal.**
- `@signalapp/libsignal-client` (npm) is **desktop-only** (no iOS/Android, no
  official WASM). Real libsignal on mobile means a *custom* Capacitor plugin
  wrapping Signal's Swift CocoaPod (iOS) + `libsignal-android` AAR (Android, from
  Signal's private Maven) — two APIs, no maintained binding to copy, ~weekly
  breaking releases published "for Signal's own use."
- **libsignal is AGPLv3 with no linking exception** → bundling it into a signed
  proprietary app triggers copyleft (AGPL §13 network clause): you'd have to
  open-source the messaging client or get a commercial license Signal doesn't
  offer. **Potential legal blocker.**
- **Recommendation:** keep *Signal's actual cryptography* (X3DH + Double Ratchet)
  but via a **permissively-licensed** library — **vodozemac** (Matrix's Rust
  Olm/Megolm, Apache-2.0) or **MLS** (OpenMLS / mls-rs, modern group E2E). Same
  cryptographic method, none of the AGPL / "for our own use" traps. (Managed E2E
  SDKs — Matrix, Virgil — are the build-vs-buy alternative.)

**2. The remote-URL WebView is the crux — isolate the messaging surface.**
Keys-in-Keychain is necessary but NOT sufficient: plaintext is composed/rendered
in the WebView, so if remotely-served `astradaclub.com` JS can reach that
WebView/bridge, the operator can exfiltrate plaintext = a server-can-read backdoor
by construction. **Non-negotiable:** the messaging surface must be a
fully-isolated, locally-loaded context that loads **zero remote JS** (strict CSP),
or a native screen, talking to the plugin over a narrow typed bridge.

**3. Full-scope-first is the top risk to ever shipping — cut to 1:1 single-device.**
Multi-device (Sesame) + Sender-Key groups + passphrase backup are where E2E
projects die for quarters (per-device fan-out, device provisioning, history sync,
brute-forceable backups, "I lost my chats" tickets non-technical founders will
file). **Revised MVP:** 1:1, **single-device** (re-register on a new device;
"messages stay on this device" notice), with **safety-number / key-change
verification IN the first release** — otherwise it's trust-on-first-use against a
key directory *we* control, i.e. we could MITM our own users undetected. Then
groups → external audit → defer multi-device + backup until demand proves it out.

**Also:**
- **Metadata honesty:** contents are E2E but **we + Ably see who-messages-whom +
  when** (worse than Signal; for a founders' club the social graph IS the asset).
  Say so in the copy; minimize metadata retention; don't claim Signal parity.
- **App-store-cadence trap:** bundling crypto means every fix needs a 1–7 day
  review with no instant rollback. Mitigate from message #1: strict **envelope
  versioning** + server-side capability negotiation + **feature-flag** the native
  surface so a bad crypto build can be disabled remotely.
- **Product check:** validate that founders actually want Signal-grade E2E vs
  reliable cross-platform/searchable chat before committing to **app-only DMs**
  (many B2B members live on desktop). If E2E stays, plan a labeled web fallback.

### Revised Phase 0 (kill-criteria spike, ~2–3 wks, go/no-go)
Prove a **1:1 X3DH + Double Ratchet round-trip on real iOS *and* Android** through
a custom Capacitor plugin wrapping the chosen **permissive** Rust lib, with the
full session/prekey store in Keychain/Keystore and keys never crossing the JS
bridge. Not green in the time-box → fall back to a managed E2E SDK (or stay on
Whop for DMs). Resolve the **license** question and **export-compliance**
(`ITSAppUsesNonExemptEncryption=true` + BIS annual self-classification + French
ANSSI declaration) before any Phase 1 code.
