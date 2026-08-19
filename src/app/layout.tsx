import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ShieldQuest — Project SHIELD",
  description:
    "Choose Right. Protect Together. Practise recognising risk, handling pressure and protecting your friends before the situation happens in real life.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ShieldQuest",
    statusBarStyle: "black-translucent",
  },
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
      </body>
    </html>
  );
}
