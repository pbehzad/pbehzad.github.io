import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parham Behzad",
  description: "Composer Parham Behzad explores musical systems, ecology, and emergent form through contemporary composition, participatory sound, and live electronics.",
  icons: {
    icon: "/branding/logo-primary.svg",
    shortcut: "/branding/logo-primary.svg",
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
        <link rel="icon" type="image/svg+xml" href="/branding/logo-primary.svg" />
        <link rel="shortcut icon" href="/branding/logo-primary.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
