import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tabiflow",
  description: "Lazy Capture, Batch Analyze",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tabiflow",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // For PWA feeling
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
