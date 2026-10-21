import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { IntroBoot } from "@/components/intro/IntroBoot";
import { Grain } from "@/components/ui/Grain";
import { ogImage, site } from "@/data";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * The site's typography is two families, self-hosted by next/font and
 * emitted into the build — see src/lib/fonts.ts for what each one does
 * and why they are the ones they are. There is no third-party font
 * request on any page, so there is no stylesheet that can fail in
 * front of a visitor and no account that has to be configured before
 * the site has its own letterforms.
 */

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.legalName} | Film Production, New Delhi`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  keywords: [
    "film production company",
    "New Delhi",
    "brand films",
    "commercial films",
    "documentaries",
    "TVC",
    site.legalName,
  ],
  authors: [{ name: site.legalName }],
  creator: site.legalName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: `${site.name} — ${site.legalName}`,
    title: `${site.name} — ${site.legalName}`,
    description: site.description,
    url: site.url,
    locale: "en_IN",
    images: [
      {
        url: ogImage.src,
        width: ogImage.width,
        height: ogImage.height,
        alt: ogImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.legalName}`,
    description: site.description,
    images: [ogImage.src],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* The opening sequence is armed by <IntroBoot /> before React
       hydrates, which means <html> legitimately carries attributes the
       server never wrote. That is the point of doing it there, so the
       difference is declared rather than reported. */
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="bg-ink text-bone antialiased">
        {/* Arms the opening sequence before anything paints. */}
        <IntroBoot />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-bone focus:px-4 focus:py-2 focus:text-sm focus:text-ink"
        >
          Skip to content
        </a>
        {children}
        <Grain />
      </body>
    </html>
  );
}
