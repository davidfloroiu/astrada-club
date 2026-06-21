"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Client-side auth context. The real session is established server-side via Whop
 * OAuth (see /api/auth/whop/*) and injected here from the root layout as
 * `initialUser`, so components render with the correct state on first paint.
 */
export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  hasAccess: boolean;
  /** Owner/admin/moderator on the company team — can create events, manage. */
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  initialUser = null,
  children,
}: {
  initialUser?: AuthUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore — navigate away regardless */
    }
    setUser(null);
    window.location.href = "/";
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, signOut }), [user, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
