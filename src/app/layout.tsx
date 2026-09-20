import type { Metadata, Viewport } from "next";
import "./fonts.css";
import "./globals.css";
import "./ui/ui.css";
import "./ui/shell.css";
import "./ui/home.css";
import "./ui/index.css";
import "./ui/page.css";

export const metadata: Metadata = {
  title: "Parham Behzad",
  description: "Parham Behzad is a composer exploring emergent musical systems, ecological sound practices, and participatory performanc",
  icons: {
    icon: "/branding/logo-primary.svg",
    shortcut: "/branding/logo-primary.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a09",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/branding/logo-primary.svg" />
        <link rel="shortcut icon" href="/branding/logo-primary.svg" />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
