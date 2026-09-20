import type { Metadata } from "next";
import { CONTACT, OPENING_HOURS_ISO, SITE } from "./config";

/**
 * Référencement — source unique des titres, descriptions et données
 * structurées du site. Les pages, le sitemap et app/layout.tsx en dérivent :
 * changer un texte ici suffit.
 *
 * Règles d'écriture (19/09/2026) : un titre commence par ce qu'une cliente
 * tape dans Google — la prestation, puis la ville — et le nom de la maison
 * suit, ajouté par TITLE_SUFFIX. Une description tient en 160 caractères :
 * au-delà, Google la coupe.
 */

/** Ajouté à chaque titre de page : « … — Maison Kanali ». */
export const TITLE_SUFFIX = ` — ${SITE.name}`;

export interface PageSeo {
  /** Chemin de la page dans l'adresse du site. */
  path: string;
  /** Titre, sans TITLE_SUFFIX. */
  title: string;
  description: string;
}

/** Pages publiques, dans l'ordre du sitemap. */
export const PAGES = {
  accueil: {
    path: "/",
    title: "Ongles, cils & maquillage à Saint-Quentin",
    description:
      "Showroom beauté sur rendez-vous à Saint-Quentin : ongles et maquillage par Kandylove Beauty, extensions de cils par Naftali, formations professionnelles.",
  },
  kandylove: {
    path: "/kandylove",
    title: "Ongles & maquillage à Saint-Quentin · Kandylove Beauty",
    description:
      "Manucure semi-permanent, gainage, capsules, pédicure spa et maquillage à Saint-Quentin : Kandylove Beauty, le pôle ongles & maquillage de Maison Kanali.",
  },
  naftali: {
    path: "/naftali",
    title: "Extensions de cils à Saint-Quentin · Naftali",
    description:
      "Naftali, by Maison Kanali : extensions de cils cil à cil, pose mixte et volume russe à Saint-Quentin. Un regard signé, sur rendez-vous.",
  },
  formations: {
    path: "/formations",
    title: "Formation prothésiste ongulaire & cils à Saint-Quentin",
    description:
      "Formation prothésiste ongulaire à Saint-Quentin : coaching privé de 2 jours, certificat inclus, par Kandylove Beauty. Formation extensions de cils par Naftali.",
  },
  rendezVous: {
    path: "/rendez-vous",
    title: "Prendre rendez-vous en ligne",
    description:
      "Prenez rendez-vous en ligne à Saint-Quentin : ongles et maquillage par Kandylove Beauty, extensions de cils par Naftali. Votre créneau en quelques instants.",
  },
  aPropos: {
    path: "/a-propos",
    title: "À propos",
    description:
      "L'histoire de Maison Kanali : un showroom beauté sur rendez-vous fondé à Saint-Quentin par Viminde Kandy et Viminde Nafi, autour de Kandylove Beauty et Naftali.",
  },
} satisfies Record<string, PageSeo>;

/** Réglages communs des aperçus de partage (WhatsApp, Instagram, Facebook). */
export const OPEN_GRAPH = {
  type: "website",
  locale: "fr_FR",
  siteName: SITE.name,
  images: [{ url: "/images/og.jpg", width: 1200, height: 630 }],
} satisfies Metadata["openGraph"];

/**
 * Métadonnées d'une page publique. Sans `openGraph` propre, une page
 * hériterait de celui de l'accueil : chaque lien partagé afficherait alors
 * le titre de l'accueil. L'adresse canonique écarte les doublons (paramètres
 * de suivi, anciennes adresses).
 *
 * Titre en `absolute` : le gabarit de app/layout.tsx ne s'applique pas à
 * l'accueil (même segment que le layout), on écrit donc le titre complet
 * partout — identique à celui de l'aperçu de partage.
 */
export function pageMetadata(page: PageSeo): Metadata {
  const title = `${page.title}${TITLE_SUFFIX}`;
  return {
    title: { absolute: title },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      ...OPEN_GRAPH,
      title,
      description: page.description,
      url: page.path,
    },
  };
}

/**
 * Données structurées schema.org — la carte d'identité de la maison pour
 * Google : le nom du site (affiché dans les résultats), puis le salon — où,
 * quels horaires, quels réseaux. Prépare aussi la fiche d'établissement.
 */
export const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#site`,
      name: SITE.name,
      url: SITE.url,
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE.url}/#maison` },
    },
    {
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
        postalCode: CONTACT.postalCode,
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
          opens: OPENING_HOURS_ISO.opens,
          closes: OPENING_HOURS_ISO.closes,
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
    },
  ],
};
