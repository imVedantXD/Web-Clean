import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import { getSessionUser } from "@/lib/auth";
import { SITE } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AshaFuelLauncher } from "@/components/ashafuel-launcher";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Sahayata Web — Connect Volunteers with Community Needs in India",
    template: "%s | Sahayata Web",
  },
  description: SITE.description,
  keywords: SITE.keywords,
  applicationName: SITE.name,
  authors: [{ name: "Vedant Pandey" }],
  creator: "Vedant Pandey",
  publisher: "Sahayata Web",
  category: "Social Impact & Volunteerism",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
      "hi-IN": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE.url,
    siteName: SITE.name,
    title: "Sahayata Web — Seva, made simple · Digital India",
    description: SITE.description,
    images: [
      {
        url: "/images/hero.svg",
        width: 1600,
        height: 1000,
        alt: "Volunteers serving their community through Sahayata Web",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahayata Web — Seva, made simple",
    description: SITE.description,
    images: ["/images/hero.svg"],
    creator: "@sahayataweb",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: { icon: "/icon.svg" },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "target-audience": "Volunteers, NGOs, Citizens across India",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#05070d" },
    { media: "(prefers-color-scheme: light)", color: "#f6f8fc" },
  ],
};

const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      alternateName: ["Sahayata", "Sahayata Platform", "Sahayata Seva India"],
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#organization` },
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE.url}/campaigns?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "NGO",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/icon.svg`,
      image: `${SITE.url}/images/hero.svg`,
      description:
        "Digital India community service and volunteer engagement platform connecting citizens with elder care, food relief, cleanups, health camps and education.",
      founder: {
        "@type": "Person",
        name: "Vedant Pandey",
        jobTitle: "Founder & Lead Developer",
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      knowsLanguage: ["en", "hi"],
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="website-structured-data"
          strategy="beforeInteractive"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className={`${inter.variable} ${sora.variable} bg-page font-sans text-ink antialiased`}>
        <Providers>
          <SiteHeader
            user={
              user
                ? { name: user.name, email: user.email, avatarUrl: user.avatarUrl }
                : null
            }
          />
          <main id="main">{children}</main>
          <SiteFooter />
          <AshaFuelLauncher />
        </Providers>
      </body>
    </html>
  );
}
