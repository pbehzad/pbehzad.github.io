import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./fonts.css";
import "./globals.css";
import "./ui/ui.css";
import "./ui/shell.css";
import "./ui/home.css";
import "./ui/index.css";
import "./ui/page.css";
import "./ui/article.css";
import "./ui/metal.css";
import { MetalBackground } from "./ui/MetalBackground";

// Public typefaces, downloaded and self-hosted by next/font at build time.
// Sans carries titles and reading text; Mono carries the brand, labels,
// dates and metadata. Only the latin files are preloaded; latin-ext (Dvořák,
// Łódź) still loads on demand through its unicode-range. The public tokens
// read these through --font-plex-sans and --font-plex-mono (ui.css).
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-plex-mono",
});

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
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/branding/logo-primary.svg" />
        <link rel="shortcut icon" href="/branding/logo-primary.svg" />
      </head>
      <body className="antialiased">
        <MetalBackground />
        {children}
      </body>
    </html>
  );
}
