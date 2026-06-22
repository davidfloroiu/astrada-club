"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemePref = "light" | "dark" | "system";
type Resolved = "light" | "dark";

interface ThemeContextValue {
  pref: ThemePref;
  resolved: Resolved;
  setPref: (p: ThemePref) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "astrada-theme";

function readPref(): ThemePref {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" || v === "dark" || v === "system" ? v : "system";
}

/** Apply the resolved theme to <html> and keep the status-bar color in sync. */
function applyResolved(resolved: Resolved) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#080d18" : "#edebe5");
  }
}

/**
 * Theme state: light / dark / system (default). System follows the device and
 * reacts to OS changes. A small inline script in layout.tsx applies the right
 * class before paint so there's no flash; this provider keeps it in sync after
 * hydration and exposes the resolved theme (used to theme the Whop embeds).
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(readPref);
  const [resolved, setResolved] = useState<Resolved>("light");

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const recompute = () => {
      const next: Resolved =
        pref === "system" ? (mql.matches ? "dark" : "light") : pref;
      setResolved(next);
      applyResolved(next);
    };
    recompute();
    if (pref === "system") {
      mql.addEventListener("change", recompute);
      return () => mql.removeEventListener("change", recompute);
    }
  }, [pref]);

  const setPref = useCallback((p: ThemePref) => {
    setPrefState(p);
    try {
      window.localStorage.setItem(STORAGE_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return (
    useContext(ThemeContext) ?? {
      pref: "system",
      resolved: "light",
      setPref: () => {},
    }
  );
}
