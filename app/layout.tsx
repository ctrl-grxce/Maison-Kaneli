import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CONTACT, SITE } from "@/lib/config";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: "/images/og.jpg", width: 1200, height: 630 }],
  },
  /* Code de validation Google Search Console — via variable Vercel. */
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

/**
 * Données structurées schema.org — la carte d'identité du salon pour Google :
 * qui est « Maison Kanali », où, quels horaires, quels réseaux. Renforce le
 * référencement de marque et prépare la fiche d'établissement.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": `${SITE.url}/#maison`,
  name: SITE.name,
  description: SITE.description,
  url: SITE.url,
  image: `${SITE.url}/images/og.jpg`,
  logo: `${SITE.url}/images/logo-maison-kanali.jpg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: CONTACT.city,
    addressRegion: CONTACT.region,
    addressCountry: "FR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "10:00",
      closes: "17:00",
    },
  ],
  priceRange: "€€",
  sameAs: [
    `https://www.instagram.com/${CONTACT.instagramKandylove}/`,
    `https://www.instagram.com/${CONTACT.instagramNaftali}/`,
    `https://www.facebook.com/${CONTACT.facebookKandylove}`,
  ],
  potentialAction: {
    "@type": "ReserveAction",
    target: `${SITE.url}/rendez-vous`,
    name: "Prendre rendez-vous",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfbf7",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jost.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
