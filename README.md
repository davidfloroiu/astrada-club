# Astrada

A private, paid community for founders — built with Next.js 16, React 19, Tailwind v4, TypeScript, and **Whop**.

Astrada is a premium members' club: a polished marketing site **plus** a gated member area, with real **Sign in with Whop** (OAuth 2.1 + PKCE), membership gating, an embedded live community chat, post-payment webhooks, and on-domain Whop checkout.

## Brand kit

Per the official Astrada Club logo package (vendored in [`public/brand/`](public/brand)):

- **Colors** — Deep Navy `#0E1B30`, Platinum `#C5CAD3` (gradient `#F3F5F8 → #AEB5C0 → #9AA1AD`), Warm Paper `#EDEBE5`
- **Type** — Cormorant Garamond (display) + Hanken Grotesk (body)
- **Mark** — the platinum "comet" monogram; `AstradaMark` in `src/components/ui/Logo.tsx` (`navy` / `light` / `platinum` tones), favicon in `src/app/icon.svg`
- **Tokens** — defined in `src/app/globals.css` (`@theme`): `--color-navy`, `--color-platinum*`, warm-paper `--color-canvas`, etc.

Logo lockups (primary/horizontal/mark, SVG + PNG) and the brand notes live in `public/brand/`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Whop credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The marketing site and embedded checkout work immediately; sign-in, chat, and webhooks need the Whop credentials below.

## Whop integration

| Feature | Where |
| --- | --- |
| Sign in with Whop (OAuth 2.1 + PKCE) | `src/lib/whop/oauth.ts`, `src/app/api/auth/whop/{login,callback}/route.ts` |
| Encrypted session (iron-session) | `src/lib/whop/session.ts` |
| Membership gating (`users.checkAccess`) | `src/lib/whop/access.ts`, `src/app/(dashboard)/layout.tsx` |
| Embedded community chat | `src/components/chat/*`, `src/app/api/chat/token/route.ts` |
| Webhook (`payment.succeeded`) | `src/app/api/webhooks/whop/route.ts` |
| On-domain checkout | `src/components/marketing/CheckoutPlans.tsx` |
| Config (IDs, plans, experiences) | `src/lib/whop/config.ts` |
| Server SDK singleton | `src/lib/whop/sdk.ts` |

### Finishing setup in the Whop dashboard

1. **OAuth app** (Developer → OAuth): set `NEXT_PUBLIC_WHOP_APP_ID` + `WHOP_CLIENT_SECRET`. Register the redirect URI `…/api/auth/whop/callback` (local **and** production).
2. **API key** (Settings → API keys): set `WHOP_API_KEY`. It needs permissions for access checks, `member:email:read` (webhook email/phone enrichment), and `chat:read` / `chat:message:create` (chat embed tokens).
3. **Webhook** (Developer → Webhooks): point it at `…/api/webhooks/whop`, subscribe to `payment.succeeded`, and set `WHOP_WEBHOOK_SECRET`.
4. **Session**: set `SESSION_SECRET` (32+ chars: `openssl rand -base64 32`).

All env vars are documented in [`.env.example`](.env.example).

> The membership IDs (company, product, plans, chat/forum/event/announcement experiences) are pre-filled in `src/lib/whop/config.ts`.

## Routes

| Route | Access | What it is |
| --- | --- | --- |
| `/` | Public | Marketing landing — hero, manifesto, benefits, who-it's-for, levels, membership + **embedded checkout**, FAQ |
| `/join` | Public | Join page — message + on-domain checkout (also the no-membership redirect target) |
| `/login` | Public | **Sign in with Whop** |
| `/dashboard` | Member | Member home — community spotlight, membership, sample events/perks |
| `/chat` | Member | **Live Whop community chat**, embedded |
| `/members`, `/members/[id]` | Member | Member directory + profiles (sample) |
| `/events`, `/deals` | Member | Events + perks (sample) |
| `/api/auth/whop/login`, `/callback`, `/api/auth/logout` | — | OAuth flow |
| `/api/chat/token` | Member | Mints a scoped chat embed token |
| `/api/webhooks/whop` | Whop | Signed webhook receiver |

## How auth + gating works

1. `/login` → `/api/auth/whop/login` generates PKCE + state, stores them in the encrypted session, and redirects to Whop.
2. Whop redirects back to `/api/auth/whop/callback`, which verifies state, exchanges the code (with `client_secret` + `code_verifier`), loads the user via OIDC `userinfo`, and runs `users.checkAccess(productId, …)`.
3. The session stores the Whop user + `hasAccess`. The dashboard layout redirects: no session → `/login`; signed in but no membership → `/join`.
4. The root layout reads the session server-side and seeds the client `AuthProvider`, so the navbar/dashboard render correct auth state on first paint.

## Architecture

```
src/
  app/
    (marketing)/   # public site (navbar + footer) — landing, join, apply
    (auth)/        # standalone login layout
    (dashboard)/   # gated member area (server-side Whop gate)
    api/           # auth, chat token, webhook route handlers
    layout.tsx     # root: fonts + session-seeded AuthProvider
  components/      # ui/, marketing/, dashboard/, chat/, members/, events/, deals/
  lib/
    whop/          # config, sdk, session, oauth, access
    auth.tsx       # client auth context (seeded from the server session)
    data.ts        # sample directory/events/perks (clearly labeled in-app)
```

## Deploy

Deploys to [Vercel](https://vercel.com/new). Set all env vars from `.env.example`, then add the production redirect URI to the Whop OAuth app and point the Whop webhook at the production `/api/webhooks/whop`.
