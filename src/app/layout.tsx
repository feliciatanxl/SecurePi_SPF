import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShieldQuest — Youth Crime Prevention",
  description:
    "A youth crime prevention Progressive Web App: practise the moment of choice, not the lecture.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ShieldQuest",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#05080f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-full bg-ink-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
