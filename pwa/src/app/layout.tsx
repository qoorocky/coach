import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const notoSansTc = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coach — HIIT 訓練",
  description: "HIIT 課程播放器，支援離線。",
  manifest: "/manifest.webmanifest",
  applicationName: "Coach",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Coach",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
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
    <html
      lang="zh-Hant"
      suppressHydrationWarning
      className={`${notoSansTc.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased font-[var(--font-noto-sans-tc)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
