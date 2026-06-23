# In-house E2E messaging — architecture & roadmap

Goal: replace the Whop DM/group-chat embed with our **own** end-to-end encrypted
messaging, using the **Signal Protocol** (X3DH + Double Ratchet; Sender Keys for
groups; Sesame for multi-device). Community chat can stay on Whop for now; this
doc is about **private DMs + group chats**.

> Decisions locked (2026-06-22): **real E2E, native-bundled** · realtime = **Ably**
> (managed, ciphertext-only relay) · **full scope** — DMs + groups + multi-device
> + encrypted backup. Audit-worthy, multi-phase build.

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
