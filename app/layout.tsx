import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // For PWA feeling
  themeColor: "black", // Moved here if applicable, or keep in metadata if it's not viewport related (Actually theme-color is viewport in Next 14+)
};

export const metadata: Metadata = {
  title: "Tabiflow",
  description: "Lazy Capture, Batch Analyze",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tabiflow",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
         <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-zinc-950 text-white min-h-screen selection:bg-indigo-500/30">
        {children}
      </body>
    </html>
  );
}
