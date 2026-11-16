import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
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
// The three IBM Plex families each have one voice (see the type system in
// ui.css): Serif for the work (titles, introductions, reading text), Sans
// for the site (menu, navigation, headings within texts), Mono for the
// archive (the brand, labels, dates, metadata). latin-ext (Dvořák, Łódź)
// loads on demand through its unicode-range.
//
// next/font preloads every file it declares, on every page, so the faces
// are grouped by need. Serif Light and Regular and Mono Regular and Medium
// are above the fold on every page, so they are preloaded. Serif Bold, the
// Serif italic and every Sans weight appear only in some places, so they
// are declared without preload and a page downloads them only if it uses
// them. ui.css names each group through its own variable.
const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["300", "400"],
  display: "swap",
  variable: "--font-plex-serif",
});

const plexSerifBold = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  preload: false,
  variable: "--font-plex-serif-bold",
});

const plexSerifItalic = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
  preload: false,
  variable: "--font-plex-serif-italic",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

const FONT_VARIABLES = [plexSerif, plexSerifBold, plexSerifItalic, plexSans, plexMono]
  .map((font) => font.variable)
  .join(" ");

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
    <html lang="en" className={FONT_VARIABLES}>
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
