import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { DemoConsole } from "@/components/DemoConsole";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Project SHIELD — ShieldQuest",
    template: "%s · Project SHIELD",
  },
  applicationName: "Project SHIELD",
  description:
    "A youth-led interactive crime-prevention experience that helps young people practise recognising risk, making safer decisions and protecting their peers.",
  openGraph: {
    title: "Project SHIELD — ShieldQuest",
    description:
      "A youth-led interactive crime-prevention experience for practising safer decisions and protecting peers.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Project SHIELD — ShieldQuest. Choose Right. Protect Together. Working prototype.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Project SHIELD — ShieldQuest",
    description:
      "A youth-led interactive crime-prevention experience for practising safer decisions and protecting peers.",
    images: ["/og.png"],
  },
  manifest: "/manifest.webmanifest",
  /*
   * The favicon is the original ShieldQuest mark in `public/icon.svg`; the
   * Apple touch icon is the same artwork rasterised by `apple-icon.tsx`.
   * Declaring `icons` at all opts out of Next's automatic file-based icon
   * links, so the generated `/apple-icon` route has to be named here too —
   * without it iOS falls back to a screenshot of the page.
   */
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "ShieldQuest",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b2545",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={sans.variable}>
      <body
        className="min-h-full bg-canvas text-ink antialiased"
        style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <DemoConsole />
      </body>
    </html>
  );
}
