import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coach — HIIT 訓練",
  description: "HIIT 課程播放器，支援離線。",
  manifest: "/manifest.webmanifest",
  applicationName: "Coach",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Coach",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
