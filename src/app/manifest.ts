import type { MetadataRoute } from "next";

/**
 * Web app manifest — lets members install Astrada to their home screen straight
 * from the site (no app store). Served at /manifest.webmanifest.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Astrada Club",
    short_name: "Astrada",
    description:
      "A private members' club for founders — the community, forum, events, and member directory.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#edebe5",
    theme_color: "#edebe5",
    orientation: "portrait",
    categories: ["business", "social", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
