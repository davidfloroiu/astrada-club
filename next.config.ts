import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native push SDKs are server-only and rely on Node built-ins / dynamic
  // requires — keep them out of the webpack bundle and load from node_modules.
  serverExternalPackages: ["firebase-admin", "apns2"],
  async headers() {
    return [
      {
        // Always serve a fresh service worker, typed correctly.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
