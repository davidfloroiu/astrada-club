import "server-only";
import { whop } from "./config";

/**
 * Whop OAuth 2.1 + PKCE helpers (server-side flow).
 * Endpoints per docs.whop.com/developer/guides/oauth.
 */
const AUTHORIZE_URL = "https://api.whop.com/oauth/authorize";
const TOKEN_URL = "https://api.whop.com/oauth/token";
const USERINFO_URL = "https://api.whop.com/oauth/userinfo";
const SCOPE = "openid profile email";

function base64url(bytes: Uint8Array) {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomString(byteLength = 32) {
  return base64url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

async function sha256Challenge(verifier: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64url(new Uint8Array(digest));
}

export interface PkceMaterial {
  codeVerifier: string;
  state: string;
  nonce: string;
}

export function createPkce(): PkceMaterial {
  return {
    codeVerifier: randomString(32),
    state: randomString(16),
    nonce: randomString(16),
  };
}

export function redirectUri() {
  return (
    process.env.NEXT_PUBLIC_WHOP_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/auth/whop/callback`
  );
}

export async function buildAuthorizeUrl(pkce: PkceMaterial) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: whop.appId,
    redirect_uri: redirectUri(),
    scope: SCOPE,
    state: pkce.state,
    nonce: pkce.nonce,
    code_challenge: await sha256Challenge(pkce.codeVerifier),
    code_challenge_method: "S256",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export async function exchangeCode(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(),
      client_id: whop.appId,
      client_secret: process.env.WHOP_CLIENT_SECRET,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export interface WhopUserInfo {
  sub: string; // user_… id
  name?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  username?: string;
  preferred_username?: string;
}

export async function fetchUserInfo(accessToken: string): Promise<WhopUserInfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`userinfo failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}
