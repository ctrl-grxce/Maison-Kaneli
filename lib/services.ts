/**
 * Catalogue des prestations et formations de Maison Kanali.
 *
 * ✏️  C'est LE fichier à modifier pour ajuster tarifs, durées ou descriptions.
 * Sources : carte ongles Kandylove (août 2026), flyer TARIF (maquillage),
 * formation onglerie Kandylove Beauty (350 € sans kit / 420 € avec kit depuis
 * le 18/09/2026 — avant : 650 € / 720 €) et grille cils Naftali du
 * 08/11/2026 (fin de la promo à 40 €) : de 50 € (cil à cil) à 80 € (méga
 * volume), remplissage à partir de 35 €, dépose 15 €.
 */

import { OPENING } from "./config";

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
  /** Acompte imposé pour cette prestation, en centimes — prime sur le montant
   *  de la catégorie. A servi à la prestation de test à 1 € du 18/09/2026
   *  (retirée après validation du paiement réel) ; gardé pour un futur test. */
  depositCentsOverride?: number;
  /** Prestation de test interne : réservable dans le tunnel, mais JAMAIS
   *  affichée sur les pages vitrines (cf. `servicesByCategory`). */
  isTest?: boolean;
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
    /* Sur devis — décision des fondatrices du 30/08/2026 (avant : 80 €). */
    price: "Sur devis",
  },
  {
    id: "mariee-jour-j",
    brand: "kandylove",
    category: "maquillage",
    name: "Mariée — Jour J",
    description:
      "Mise en beauté du jour J. Faux cils naturel +5 €, volume +10 €.",
    durationMin: 90,
    /* Sur devis — décision des fondatrices du 30/08/2026 (avant : 80 €). */
    price: "Sur devis",
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
  /*    Nouveaux tarifs depuis le 08/11/2026 (fin de la promo à 40 €).      */
  {
    id: "cil-a-cil",
    brand: "naftali",
    category: "cils",
    name: "Pose cil à cil",
    description:
      "Une extension par cil naturel — l'effet mascara, en plus raffiné.",
    durationMin: 120,
    price: "50 €",
  },
  {
    id: "pose-mixte",
    brand: "naftali",
    category: "cils",
    name: "Pose mixte",
    description:
      "Entre cil à cil et volume — densité maîtrisée, regard velours.",
    durationMin: 135,
    price: "55 €",
  },
  {
    id: "volume-russe-leger",
    brand: "naftali",
    category: "cils",
    name: "Volume russe léger",
    description:
      "Des bouquets fins pour un volume doux et naturel.",
    durationMin: 140,
    price: "60 €",
  },
  {
    id: "volume-russe",
    brand: "naftali",
    category: "cils",
    name: "Volume russe",
    description:
      "Bouquets faits main pour un regard intense et aérien.",
    durationMin: 150,
    price: "65 €",
  },
  {
    id: "volume-russe-intense",
    brand: "naftali",
    category: "cils",
    name: "Volume russe intense",
    description:
      "Des bouquets plus fournis pour un regard dense et charbonneux.",
    durationMin: 165,
    price: "70 €",
  },
  {
    id: "mega-volume",
    brand: "naftali",
    category: "cils",
    name: "Méga volume",
    description:
      "Le volume maximal — un regard spectaculaire, toujours léger.",
    durationMin: 180,
    price: "80 €",
  },
  {
    id: "remplissage-cils",
    brand: "naftali",
    category: "cils",
    name: "Remplissage cils",
    description:
      "L'entretien de votre pose, idéalement toutes les 3 semaines.",
    durationMin: 90,
    price: "À partir de 35 €",
  },
  {
    id: "depose-cils",
    brand: "naftali",
    category: "cils",
    name: "Dépose",
    description:
      "Retrait tout en douceur, dans le respect du cil naturel.",
    durationMin: 30,
    price: "15 €",
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
    priceLabel: "350 € – 420 €",
    kitOptions: [
      { id: "sans-kit", label: "Sans kit", price: "350 €" },
      {
        id: "avec-kit",
        label: "Avec kit professionnel (valeur 220 €)",
        price: "420 €",
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

/** Une prestation du catalogue, ou un enchaînement de plusieurs prestations
 *  (identifiant « id1+id2 », cf. `combineServices`). */
export function getService(id: string): Service | undefined {
  if (id.includes(COMBO_SEPARATOR)) return getCombo(id);
  return SERVICES.find((s) => s.id === id);
}

/* ── Plusieurs prestations dans un même rendez-vous ──────────────────────
 * Demande de Gradi du 08/11/2026 : on peut prendre plusieurs prestations
 * d'un coup, sans refaire tout le parcours. Elles s'enchaînent dans un seul
 * créneau, avec la même personne — donc dans le MÊME pôle (Kandylove ou
 * Naftali). Un seul acompte, au montant habituel, quel que soit le nombre de
 * prestations. L'enchaînement est vu partout comme UNE prestation « A + B »
 * (durées et tarifs additionnés) : la base, les emails, la facture et
 * /gestion fonctionnent sans changement.                                    */

export const COMBO_SEPARATOR = "+";
export const MAX_COMBO_SERVICES = 3;
/** Durée maximale d'un rendez-vous acceptée par la base (8 h). */
export const MAX_COMBO_DURATION_MIN = 480;

/** Fourchette lue dans un tarif : « 50 € », « À partir de 35 € », « 60 – 70 € ».
 *  `null` pour « Sur devis », « Sur demande »… */
interface PriceRange {
  min: number;
  max: number;
  from: boolean;
}

function parsePriceRange(label: string): PriceRange | null {
  const text = label.trim();
  const from = /^à partir de\s+/i.test(text);
  const body = text.replace(/^à partir de\s+/i, "");
  const range = body.match(/^(\d+)\s*[–-]\s*(\d+)\s*€$/);
  if (range) {
    return { min: Number(range[1]) * 100, max: Number(range[2]) * 100, from };
  }
  const single = body.match(/^(\d+)(?:[.,](\d{1,2}))?\s*€$/);
  if (!single) return null;
  const cents =
    Number(single[1]) * 100 + (single[2] ? Number(single[2].padEnd(2, "0")) : 0);
  return { min: cents, max: cents, from };
}

function formatPriceRange({ min, max, from }: PriceRange): string {
  const amount =
    min === max ? formatEuros(min) : `${formatEuros(min).replace(" €", "")} – ${formatEuros(max)}`;
  return from ? `À partir de ${amount}` : amount;
}

/** Une prestation peut s'ajouter à d'autres si son tarif est chiffré (les
 *  prestations « Sur devis », comme la mariée, se réservent seules). */
export function isCombinable(service: Service): boolean {
  return !service.isTest && parsePriceRange(effectivePrice(service).label) !== null;
}

/** Les prestations qui composent un rendez-vous (une seule, ou plusieurs). */
export function comboParts(service: Service): Service[] {
  if (!service.id.includes(COMBO_SEPARATOR)) return [service];
  return service.id
    .split(COMBO_SEPARATOR)
    .map((id) => SERVICES.find((s) => s.id === id))
    .filter((s): s is Service => s !== undefined);
}

/** Pourquoi ces prestations ne peuvent pas être réservées ensemble, ou null. */
export function comboProblem(services: Service[]): string | null {
  if (services.length === 0) return "Choisissez au moins une prestation.";
  if (services.length === 1) return null;
  if (services.length > MAX_COMBO_SERVICES) {
    return `${MAX_COMBO_SERVICES} prestations maximum par rendez-vous.`;
  }
  if (new Set(services.map((s) => s.id)).size !== services.length) {
    return "Chaque prestation ne peut être choisie qu'une fois.";
  }
  if (new Set(services.map((s) => s.brand)).size > 1) {
    return "Les prestations d'un même rendez-vous doivent être du même pôle.";
  }
  if (!services.every(isCombinable)) {
    return "Cette prestation se réserve seule.";
  }
  const total = services.reduce((sum, s) => sum + s.durationMin, 0);
  if (total > MAX_COMBO_DURATION_MIN) {
    return "Ce rendez-vous serait trop long : retirez une prestation.";
  }
  return null;
}

/** Réunit plusieurs prestations en un seul rendez-vous « A + B ». Une seule
 *  prestation est renvoyée telle quelle. */
export function combineServices(services: Service[]): Service {
  if (services.length === 1) return services[0];
  const ranges = services.map((s) => parsePriceRange(effectivePrice(s).label)!);
  const total: PriceRange = {
    min: ranges.reduce((sum, r) => sum + r.min, 0),
    max: ranges.reduce((sum, r) => sum + r.max, 0),
    from: ranges.some((r) => r.from),
  };
  return {
    id: services.map((s) => s.id).join(COMBO_SEPARATOR),
    brand: services[0].brand,
    category: services[0].category,
    name: services.map((s) => s.name).join(" + "),
    description: services.map((s) => s.name).join(", "),
    durationMin: services.reduce((sum, s) => sum + s.durationMin, 0),
    price: formatPriceRange(total),
    /* UN seul acompte, au montant habituel, quel que soit le nombre de
       prestations (dépose seule : toujours sans acompte). */
    depositCentsOverride: Math.max(...services.map(depositCentsFor)),
  };
}

function getCombo(id: string): Service | undefined {
  const services = id.split(COMBO_SEPARATOR).map((part) =>
    SERVICES.find((s) => s.id === part),
  );
  if (services.length < 2 || services.some((s) => s === undefined)) return undefined;
  const list = services as Service[];
  return comboProblem(list) === null ? combineServices(list) : undefined;
}

/** Tarif d'un rendez-vous, supplément de créneau tardif compris. */
export function priceWithLateFee(label: string, late: boolean): string {
  if (!late) return label;
  const fee = OPENING.lateFeeCents;
  const range = parsePriceRange(label);
  if (!range) return `${label} + ${formatEuros(fee)} (créneau tardif)`;
  return `${formatPriceRange({
    ...range,
    min: range.min + fee,
    max: range.max + fee,
  })} (dont ${formatEuros(fee)} créneau tardif)`;
}

export function getFormation(id: string): Formation | undefined {
  return FORMATIONS.find((f) => f.id === id);
}

export function servicesByCategory(category: Category): Service[] {
  /* `isTest` est exclue ici et pas dans le tunnel : la cliente ne doit jamais
   *  voir la prestation de test sur les pages vitrines. */
  return SERVICES.filter((s) => s.category === category && !s.isTest);
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
 *  flottante pour de l'argent). Décision Gradi du 30/08/2026, maquillage
 *  ramené de 30 € à 20 € le 20/09/2026 (Kandy) :
 *  ongles 20 € · maquillage 20 € · cils 20 €. */
export const DEPOSIT_CENTS: Record<Category, number> = {
  ongles: 2000,
  maquillage: 2000,
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
  if (service.depositCentsOverride !== undefined) {
    return service.depositCentsOverride;
  }
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

/** Le même montant, mais insécable : « 20 € » ne se coupe jamais entre le
 *  chiffre et l'euro en bout de ligne (libellé du bouton de paiement). */
export function formatEurosTight(cents: number): string {
  return formatEuros(cents).replace(" ", " ");
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
  /* Acompte égal au tarif (prestation de test) : rien à régler sur place. */
  if (priceCents === depositCents) return null;
  return formatEuros(priceCents - depositCents);
}

/**
 * Ce qu'on paie en ligne, ce qui reste sur place — une seule phrase, écrite
 * une seule fois (demande de Gradi du 20/09/2026 : au moment de payer, on ne
 * comprenait pas assez vite qu'il ne s'agissait que de l'acompte).
 * Le récapitulatif avant paiement, la page Stripe et la page de confirmation
 * en dérivent : les trois disent donc exactement la même chose.
 */
export function depositNotice(
  depositCents: number,
  remainderLabel: string | null,
): string {
  const acompte = `Vous payez seulement l'acompte de ${formatEuros(depositCents)} aujourd'hui.`;
  return remainderLabel
    ? `${acompte} Les ${remainderLabel} restants se règlent sur place, le jour du rendez-vous.`
    : `${acompte} Le reste se règle sur place, le jour du rendez-vous.`;
}
