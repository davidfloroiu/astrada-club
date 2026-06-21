import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

/** What we persist in the encrypted session cookie. */
export interface SessionData {
  /** Whop user id (user_…). Present once authenticated. */
  userId?: string;
  name?: string;
  email?: string;
  username?: string;
  profilePicture?: string;
  /** Result of the membership access check against the product. */
  hasAccess?: boolean;
  accessLevel?: string;
  /** Transient OAuth/PKCE state, set before redirect and cleared after callback. */
  oauth?: {
    codeVerifier: string;
    state: string;
    nonce: string;
    returnTo?: string;
  };
}

const sessionOptions: SessionOptions = {
  // 32+ char secret. iron-session encrypts + signs the cookie with it.
  password: process.env.SESSION_SECRET ?? "dev-only-insecure-password-change-me-32+chars",
  cookieName: "astrada_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

/** The public shape of the current user, safe to expose to client components. */
export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  hasAccess: boolean;
  /** Owner/admin/moderator on the company team — can create events, manage. */
  isAdmin: boolean;
}

export function toSessionUser(s: SessionData): SessionUser | null {
  if (!s.userId) return null;
  return {
    userId: s.userId,
    name: s.name ?? "Member",
    email: s.email ?? "",
    username: s.username,
    profilePicture: s.profilePicture,
    hasAccess: Boolean(s.hasAccess),
    isAdmin: s.accessLevel === "admin",
  };
}
