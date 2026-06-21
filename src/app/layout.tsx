import type { Metadata } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { getSession, toSessionUser } from "@/lib/whop/session";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://astradaclub.com"),
  title: {
    default: "Astrada — A new club for founders, forming now",
    template: "%s · Astrada",
  },
  description:
    "Astrada is a private members' club for founders, being built from the ground up. Join the founding circle — curated introductions, intimate dinners, and a community that actually understands the work.",
  keywords: [
    "founders club",
    "entrepreneur community",
    "founding members",
    "private network",
    "startup founders",
  ],
  openGraph: {
    title: "Astrada — A new club for founders, forming now",
    description:
      "A private members' club for founders, being built from the ground up. Join the founding circle.",
    url: "https://astradaclub.com",
    siteName: "Astrada",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const user = toSessionUser(session);

  return (
    <html
      lang="en"
      className={`${hanken.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-canvas text-ink">
        <AuthProvider initialUser={user}>{children}</AuthProvider>
      </body>
    </html>
  );
}
