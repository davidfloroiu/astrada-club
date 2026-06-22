import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { getSession, toSessionUser } from "@/lib/whop/session";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

// Runs before paint to set the theme class — avoids a flash of the wrong theme.
const themeScript = `(function(){try{var p=localStorage.getItem('astrada-theme')||'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

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
  applicationName: "Astrada",
  appleWebApp: {
    capable: true,
    title: "Astrada",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#edebe5",
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <AuthProvider initialUser={user}>{children}</AuthProvider>
        </ThemeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
