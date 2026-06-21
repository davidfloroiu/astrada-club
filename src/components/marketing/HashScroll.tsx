"use client";

import { useEffect } from "react";

/**
 * In-page anchor navigation for the marketing site.
 *
 * Two problems are solved here:
 *
 * 1. Next.js App Router's <Link> intercepts clicks on same-page hash links
 *    (e.g. `/#who` while already on `/`) and performs a client-side navigation
 *    that does NOT scroll to the fragment — so nav/footer/CTA anchors silently
 *    do nothing. This one delegated listener handles every `…#id` link in a
 *    single place: in the capture phase (before React's root-level handlers) it
 *    takes over when the target exists on the current page, and otherwise lets
 *    the link navigate normally.
 *
 * 2. Native *smooth* scrolling (CSS `scroll-behavior: smooth` /
 *    `behavior: "smooth"`) is unreliable on this page: animating through the
 *    full document fires every section's scroll-reveal animation in rapid
 *    succession, which stalls the scroll and leaves it at the top. We therefore
 *    jump with `behavior: "instant"`, which lands cleanly on the target
 *    (respecting each section's `scroll-mt-*` offset for the fixed header) and
 *    skips the intermediate reveal cascade entirely.
 *
 * It also honors a hash present on initial load (e.g. arriving from another
 * route at `/#faq`), which client-side navigation can otherwise skip.
 */
export function HashScroll() {
  useEffect(() => {
    const jumpToId = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: "instant", block: "start" });
      return true;
    };

    function handleClick(e: MouseEvent) {
      // Respect modifier clicks (open in new tab/window, etc.).
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!href) return;

      // Matches a trailing fragment: "#who" or "/#who".
      const match = href.match(/#([A-Za-z][\w-]*)$/);
      if (!match) return;

      // Only intercept when the target section is on the current page;
      // otherwise let the browser/router navigate there normally.
      if (jumpToId(match[1])) {
        // Stop here in the capture phase, before Next.js's <Link> delegated
        // handler (attached at the app root) can preventDefault + perform a
        // client-side navigation that would swallow the scroll.
        e.preventDefault();
        e.stopPropagation();
        history.pushState(null, "", `#${match[1]}`);
      }
    }

    // Capture phase: runs before React's root-level synthetic handlers.
    document.addEventListener("click", handleClick, true);

    // Honor a hash on initial load once layout has settled.
    if (window.location.hash.length > 1) {
      const id = decodeURIComponent(window.location.hash.slice(1));
      requestAnimationFrame(() => jumpToId(id));
    }

    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
