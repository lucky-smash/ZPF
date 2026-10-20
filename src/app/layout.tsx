import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import { IntroBoot } from "@/components/intro/IntroBoot";
import { Grain } from "@/components/ui/Grain";
import { ogImage, site } from "@/data";
import { adobeFontsHref } from "@/lib/fonts";
import "./globals.css";

/**
 * The site's own typography is served by Adobe Fonts — see
 * src/lib/fonts.ts for the three families and the one-time web project
 * that serves them.
 *
 * Space Grotesk stays, self-hosted by Next, as the declared fallback
 * for the supporting stack. It is not the identity: it is what the
 * interface is set in before Acumin Pro arrives, or if it never does,
 * so the site is never one network failure away from Arial. The
 * display stack falls through to system high-contrast serifs instead,
 * which is why the editorial composition reads correctly either way.
 */
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

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
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* The opening sequence is armed by <IntroBoot /> before React
       hydrates, which means <html> legitimately carries attributes the
       server never wrote. That is the point of doing it there, so the
       difference is declared rather than reported. */
    <html lang="en" className={grotesk.variable} suppressHydrationWarning>
      <head>
        {/* Adobe Fonts. Rendered only when a web project is configured,
            so an unconfigured install makes no request at all rather
            than waiting on a 404. The preconnects are worth it: the CSS
            comes from use.typekit.net and the font files themselves
            from p.typekit.net, so the second origin is needed before
            the stylesheet has even been parsed. */}
        {adobeFontsHref ? (
          <>
            <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
            <link rel="preconnect" href="https://p.typekit.net" crossOrigin="" />
            <link rel="stylesheet" href={adobeFontsHref} />
          </>
        ) : null}
      </head>
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
