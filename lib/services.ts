/**
 * Catalogue des prestations et formations de Maison Kanali.
 *
 * ✏️  C'est LE fichier à modifier pour ajuster tarifs, durées ou descriptions.
 * Sources : business plan (onglerie « à partir de 50 € »), flyer TARIF
 * (maquillage) et flyer FORMATION Kandylove Beauty.
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
    tagline: "Pose gel, remplissage, nail art — des mains impeccables.",
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
    brandLabel: "Naftali · by Maison Kanali",
    tagline: "Un regard signé, du cil à cil au volume russe.",
  },
];

export const SERVICES: Service[] = [
  /* ── Onglerie — Kandylove Beauty ─────────────────────────────────────── */
  {
    id: "pose-complete",
    brand: "kandylove",
    category: "ongles",
    name: "Pose complète gel",
    description:
      "Construction complète en gel — forme, longueur et finition sur mesure.",
    durationMin: 120,
    price: "À partir de 50 €",
  },
  {
    id: "remplissage",
    brand: "kandylove",
    category: "ongles",
    name: "Remplissage",
    description: "L'entretien idéal de votre pose, toutes les 3 à 5 semaines.",
    durationMin: 90,
    price: "À partir de 50 €",
  },
  {
    id: "nail-art",
    brand: "kandylove",
    category: "ongles",
    name: "Nail art",
    description:
      "French, babyboomer, strass ou dessins fins — en complément de votre pose.",
    durationMin: 30,
    price: "Sur demande",
  },
  {
    id: "entretien-depose",
    brand: "kandylove",
    category: "ongles",
    name: "Entretien & dépose",
    description: "Dépose soignée et soin des ongles naturels.",
    durationMin: 45,
    price: "Sur demande",
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
  {
    id: "cil-a-cil",
    brand: "naftali",
    category: "cils",
    name: "Pose cil à cil",
    description:
      "Une extension par cil naturel — l'effet mascara, en plus raffiné.",
    durationMin: 120,
    price: "Sur demande",
  },
  {
    id: "pose-mixte",
    brand: "naftali",
    category: "cils",
    name: "Pose mixte",
    description: "Entre cil à cil et volume — densité maîtrisée, regard velours.",
    durationMin: 135,
    price: "Sur demande",
  },
  {
    id: "volume-russe",
    brand: "naftali",
    category: "cils",
    name: "Volume russe",
    description: "Bouquets faits main pour un regard intense et aérien.",
    durationMin: 150,
    price: "Sur demande",
  },
  {
    id: "remplissage-cils",
    brand: "naftali",
    category: "cils",
    name: "Remplissage cils",
    description: "L'entretien de votre pose, idéalement toutes les 3 semaines.",
    durationMin: 90,
    price: "Sur demande",
  },
  {
    id: "depose-cils",
    brand: "naftali",
    category: "cils",
    name: "Dépose",
    description: "Retrait tout en douceur, dans le respect du cil naturel.",
    durationMin: 30,
    price: "Sur demande",
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
      { id: "avec-kit", label: "Avec kit professionnel", price: "420 €" },
      { id: "sans-kit", label: "Sans kit", price: "350 €" },
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
      "Suivi après formation",
      "Conseils pour lancer votre activité",
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
  naftali: "Naftali · by Maison Kanali",
};
