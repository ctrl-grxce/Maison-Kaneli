/**
 * Catalogue des prestations et formations de Maison Kanali.
 *
 * ✏️  C'est LE fichier à modifier pour ajuster tarifs, durées ou descriptions.
 * Sources : carte ongles Kandylove (août 2026), flyer TARIF (maquillage),
 * flyer FORMATION Kandylove Beauty (650 € / 720 €, août 2026) et promo cils
 * Naftali — toutes les poses à 40 € jusqu'à fin octobre 2026. La dépose,
 * elle, est à 20 € en prix normal, hors promo (décision Gradi du 29/08/2026).
 */

export type Brand = "kandylove" | "naftali";
export type Category = "ongles" | "maquillage" | "cils";

export interface Service {
  id: string;
  brand: Brand;
  category: Category;
  name: string;
  description: string;
  durationMin: number;
  /** Tarif affiché tel quel (ex. « 80 € », « À partir de 50 € », « Sur demande »). */
  price: string;
  /** Promotion en cours : remplace `price` à l'affichage, avec sa mention.
   *  `endsOn` (AAAA-MM-JJ, heure de Paris) : dernier jour de validité — passé
   *  cette date, la promo disparaît toute seule de l'affichage. */
  promo?: { price: string; until: string; endsOn: string };
}

export interface CategoryInfo {
  id: Category;
  brand: Brand;
  label: string;
  brandLabel: string;
  tagline: string;
}

export interface Formation {
  id: string;
  brand: Brand;
  name: string;
  tagline: string;
  durationLabel: string;
  priceLabel: string;
  /** Options tarifaires (ex. avec / sans kit). Vide si tarif unique. */
  kitOptions: { id: string; label: string; price: string }[];
  program: string[];
  included: string[];
}

/* ────────────────────────────────────────────────────────────────────────── */

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "ongles",
    brand: "kandylove",
    label: "Prothésie ongulaire",
    brandLabel: "Kandylove Beauty",
    tagline:
      "Manucure, gainage, extensions, pédicures — des mains et des pieds impeccables.",
  },
  {
    id: "maquillage",
    brand: "kandylove",
    label: "Maquillage",
    brandLabel: "Kandylove Beauty",
    tagline: "Du teint naturel au jour J — une mise en beauté sur mesure.",
  },
  {
    id: "cils",
    brand: "naftali",
    label: "Extensions de cils",
    brandLabel: "Naftali",
    tagline: "Un regard signé, du cil à cil au volume russe.",
  },
];

export const SERVICES: Service[] = [
  /* ── Onglerie — Kandylove Beauty (carte août 2026) ───────────────────── */
  {
    id: "manucure-semi",
    brand: "kandylove",
    category: "ongles",
    name: "Manucure & semi-permanent",
    description:
      "Manucure soignée et pose de vernis semi-permanent — brillance longue durée.",
    durationMin: 60,
    price: "35 €",
  },
  {
    id: "gainage-semi",
    brand: "kandylove",
    category: "ongles",
    name: "Gainage & semi-permanent",
    description:
      "Le gainage renforce l'ongle naturel, sublimé d'un semi-permanent.",
    durationMin: 75,
    price: "45 €",
  },
  {
    id: "extensions-capsules",
    brand: "kandylove",
    category: "ongles",
    name: "Extensions capsules",
    description:
      "Longueur et forme sur mesure — la pose signature, finitions impeccables.",
    durationMin: 120,
    price: "50 €",
  },
  {
    id: "pedicure-spa",
    brand: "kandylove",
    category: "ongles",
    name: "Pédicure Spa",
    description:
      "Le rituel complet des pieds : semi-permanent et soins profonds.",
    durationMin: 90,
    price: "60 €",
  },
  {
    id: "pedicure-basic",
    brand: "kandylove",
    category: "ongles",
    name: "Pédicure basic",
    description: "L'essentiel du soin des pieds, propre et net.",
    durationMin: 45,
    price: "30 €",
  },
  {
    id: "remplissage",
    brand: "kandylove",
    category: "ongles",
    name: "Remplissage",
    description: "L'entretien idéal de votre pose, toutes les 3 à 5 semaines.",
    durationMin: 90,
    price: "40 €",
  },

  /* ── Maquillage — Kandylove Beauty (flyer TARIF) ─────────────────────── */
  {
    id: "mariee-essai",
    brand: "kandylove",
    category: "maquillage",
    name: "Mariée — Essai",
    description:
      "Répétition complète de votre mise en beauté, en amont du grand jour.",
    durationMin: 90,
    price: "80 €",
  },
  {
    id: "mariee-jour-j",
    brand: "kandylove",
    category: "maquillage",
    name: "Mariée — Jour J",
    description:
      "Mise en beauté du jour J. Faux cils naturel +5 €, volume +10 €.",
    durationMin: 90,
    price: "80 €",
  },
  {
    id: "naturel-basic",
    brand: "kandylove",
    category: "maquillage",
    name: "Make-up basic",
    description: "Teint lumineux et regard naturel — l'élégance au quotidien.",
    durationMin: 60,
    price: "50 €",
  },
  {
    id: "naturel-liner",
    brand: "kandylove",
    category: "maquillage",
    name: "Naturel + eye-liner",
    description: "Le maquillage naturel, souligné d'un trait d'eye-liner précis.",
    durationMin: 60,
    price: "55 €",
  },
  {
    id: "classic-yeux",
    brand: "kandylove",
    category: "maquillage",
    name: "Classic — yeux travaillés",
    description: "Un regard intensifié, des dégradés soignés.",
    durationMin: 75,
    price: "60 €",
  },
  {
    id: "full-teint-levres",
    brand: "kandylove",
    category: "maquillage",
    name: "Full face — teint & lèvres",
    description: "Contouring du teint et mise en valeur des lèvres.",
    durationMin: 75,
    price: "65 €",
  },
  {
    id: "full-yeux-charges",
    brand: "kandylove",
    category: "maquillage",
    name: "Full face — yeux chargés",
    description: "Contouring complet et regard intense — l'allure des grands soirs.",
    durationMin: 90,
    price: "70 €",
  },
  {
    id: "shooting",
    brand: "kandylove",
    category: "maquillage",
    name: "Maquillage shooting",
    description: "Pensé pour la lumière des objectifs — photo & vidéo.",
    durationMin: 90,
    price: "60 – 70 €",
  },

  /* ── Extensions de cils — Naftali ────────────────────────────────────── */
  /*    Promo en cours : toutes les poses à 40 € — jusqu'à fin octobre.     */
  /*    La dépose est à 20 € en prix normal (définitif, hors promo).        */
  {
    id: "cil-a-cil",
    brand: "naftali",
    category: "cils",
    name: "Pose cil à cil",
    description:
      "Une extension par cil naturel — l'effet mascara, en plus raffiné.",
    durationMin: 120,
    price: "Sur demande",
    promo: { price: "40 €", until: "jusqu'à fin octobre", endsOn: "2026-10-31" },
  },
  {
    id: "pose-mixte",
    brand: "naftali",
    category: "cils",
    name: "Pose mixte",
    description: "Entre cil à cil et volume — densité maîtrisée, regard velours.",
    durationMin: 135,
    price: "Sur demande",
    promo: { price: "40 €", until: "jusqu'à fin octobre", endsOn: "2026-10-31" },
  },
  {
    id: "volume-russe",
    brand: "naftali",
    category: "cils",
    name: "Volume russe",
    description: "Bouquets faits main pour un regard intense et aérien.",
    durationMin: 150,
    price: "Sur demande",
    promo: { price: "40 €", until: "jusqu'à fin octobre", endsOn: "2026-10-31" },
  },
  {
    id: "remplissage-cils",
    brand: "naftali",
    category: "cils",
    name: "Remplissage cils",
    description: "L'entretien de votre pose, idéalement toutes les 3 semaines.",
    durationMin: 90,
    price: "Sur demande",
    promo: { price: "40 €", until: "jusqu'à fin octobre", endsOn: "2026-10-31" },
  },
  {
    id: "depose-cils",
    brand: "naftali",
    category: "cils",
    name: "Dépose",
    description: "Retrait tout en douceur, dans le respect du cil naturel.",
    durationMin: 30,
    price: "20 €",
  },
];

/* ── Formations professionnelles ─────────────────────────────────────────── */

export const FORMATIONS: Formation[] = [
  {
    id: "formation-onglerie",
    brand: "kandylove",
    name: "Formation Onglerie — Coaching privé",
    tagline:
      "En deux jours, repartez avec les bases solides pour gagner vos premières clientes.",
    durationLabel: "2 jours · en privé",
    priceLabel: "650 € – 720 €",
    kitOptions: [
      { id: "sans-kit", label: "Sans kit", price: "650 €" },
      {
        id: "avec-kit",
        label: "Avec kit professionnel (valeur 220 €)",
        price: "720 €",
      },
    ],
    program: [
      "Pose de gel — construction & remplissage",
      "Manucure professionnelle",
      "Extensions capsules",
      "Techniques rapides & de qualité",
    ],
    included: [
      "Certificat de formation",
      "Support PDF + fiches techniques",
      "Pratique sur modèle",
      "Photos des résultats obtenus",
      "Avis d'anciennes élèves",
      "Suivi après la formation",
      "Aide à la création de contenu & réseaux sociaux",
    ],
  },
  {
    id: "formation-cils",
    brand: "naftali",
    name: "Formation Extensions de cils",
    tagline:
      "Apprenez l'art du regard auprès de Naftali — de la pose cil à cil au volume.",
    durationLabel: "Programme personnalisé",
    priceLabel: "Sur demande",
    kitOptions: [],
    program: [
      "Théorie du cil & hygiène professionnelle",
      "Pose cil à cil",
      "Initiation au volume",
      "Pratique sur modèle",
    ],
    included: [
      "Certificat de formation",
      "Support de cours",
      "Suivi après formation",
    ],
  },
];

/* ── Accès rapides ───────────────────────────────────────────────────────── */

export function getService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getFormation(id: string): Formation | undefined {
  return FORMATIONS.find((f) => f.id === id);
}

export function servicesByCategory(category: Category): Service[] {
  return SERVICES.filter((s) => s.category === category);
}

export const BRAND_LABELS: Record<Brand, string> = {
  kandylove: "Kandylove Beauty",
  naftali: "Naftali",
};

/* ── Promotions ──────────────────────────────────────────────────────────── */

/** Date du jour (AAAA-MM-JJ) en heure de Paris — côté serveur comme client. */
function parisToday(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Promo encore valable aujourd'hui, sinon null (expiration automatique). */
export function activePromo(
  service: Service,
): NonNullable<Service["promo"]> | null {
  if (!service.promo) return null;
  return parisToday() <= service.promo.endsOn ? service.promo : null;
}

/** Tarif effectif à afficher / enregistrer : promo en cours ou tarif normal. */
export function effectivePrice(service: Service): {
  label: string;
  promo: NonNullable<Service["promo"]> | null;
} {
  const promo = activePromo(service);
  return { label: promo ? promo.price : service.price, promo };
}

/** Libellé complet pour la base et les emails (ex. « 40 € · offre jusqu'à fin octobre »). */
export function bookingPriceLabel(service: Service): string {
  const promo = activePromo(service);
  return promo ? `${promo.price} · offre ${promo.until}` : service.price;
}

/* ── Acomptes (paiement en ligne — docs/PAIEMENT.md) ─────────────────────── */

/** Montants d'acompte par catégorie, en CENTIMES (jamais de virgule
 *  flottante pour de l'argent). Décision Gradi du 30/08/2026 :
 *  ongles 20 € · maquillage 30 € · cils 20 €. */
export const DEPOSIT_CENTS: Record<Category, number> = {
  ongles: 2000,
  maquillage: 3000,
  cils: 2000,
};

/** Prestations SANS acompte en ligne :
 *  · la dépose — tout se règle sur place (décision Gradi du 30/08/2026) ;
 *  · les prestations mariées — passeront « sur devis », en attente des
 *    précisions de Gradi (30/08/2026) : circuit historique en attendant. */
const NO_DEPOSIT_SERVICE_IDS = new Set([
  "depose-cils",
  "mariee-essai",
  "mariee-jour-j",
]);

/** Acompte à régler en ligne pour une prestation, en centimes. */
export function depositCentsFor(service: Service): number {
  if (NO_DEPOSIT_SERVICE_IDS.has(service.id)) return 0;
  return DEPOSIT_CENTS[service.category] ?? 0;
}

/** 2000 → « 20 € » · 2050 → « 20,50 € ». */
export function formatEuros(cents: number): string {
  const euros = Math.floor(cents / 100);
  const rest = cents % 100;
  return rest === 0
    ? `${euros} €`
    : `${euros},${String(rest).padStart(2, "0")} €`;
}

/** Montant en centimes lu dans un libellé de tarif (« 40 € », « 40 € · offre
 *  jusqu'à fin octobre »…). `null` si le tarif n'est pas un montant fixe
 *  (« Sur demande », « À partir de 50 € »). */
export function parsePriceCents(label: string): number | null {
  const match = label.trim().match(/^(\d+)(?:[.,](\d{1,2}))?\s*€/);
  if (!match) return null;
  const euros = Number(match[1]);
  const cents = match[2] ? Number(match[2].padEnd(2, "0")) : 0;
  return euros * 100 + cents;
}

/** Reste à régler sur place (« 20 € ») une fois l'acompte déduit — `null`
 *  quand le tarif n'est pas un montant fixe : on n'affiche alors que
 *  l'acompte. */
export function remainderLabelFor(
  priceLabel: string,
  depositCents: number,
): string | null {
  const priceCents = parsePriceCents(priceLabel);
  if (priceCents === null || priceCents < depositCents) return null;
  return formatEuros(priceCents - depositCents);
}
