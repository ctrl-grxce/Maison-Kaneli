/**
 * Paramètres d'ouverture du showroom.
 * Source : Maison Kanali — du lundi au samedi, 10h00 – 18h00 (horaires
 * confirmés le 23/08/2026). Les libellés ci-dessous sont dérivés de OPENING :
 * changer les minutes ici suffit, tout le site suit.
 */
export const OPENING = {
  /** Jours ouvrés (0 = dimanche … 6 = samedi). */
  openDays: [1, 2, 3, 4, 5, 6],
  /** Ouverture, en minutes depuis minuit (10h00). */
  openMinutes: 10 * 60,
  /** Fermeture affichée, en minutes depuis minuit (18h00). Borne aussi les
   *  indisponibilités posées dans /gestion. */
  closeMinutes: 18 * 60,
  /** Dernier départ de rendez-vous (17h00), pour TOUTES les prestations,
   *  même si la prestation finit après la fermeture (décision des
   *  fondatrices du 19/09/2026 — cf. lib/availability.ts). */
  lastStartMinutes: 17 * 60,
  /** Pas entre deux débuts de créneaux, en minutes. */
  slotStepMinutes: 30,
  /** Délai minimal avant un rendez-vous (réservation le jour même), en minutes. */
  minLeadMinutes: 90,
  /** Horizon de réservation, en jours. */
  horizonDays: 60,
} as const;

/** 600 → « 10h00 » (affichage français). */
const toFr = (m: number) =>
  `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;
/** 600 → « 10:00 » (schema.org / JSON-LD). */
const toIso = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Horaires au format schema.org pour le JSON-LD (app/layout.tsx). */
export const OPENING_HOURS_ISO = {
  opens: toIso(OPENING.openMinutes),
  closes: toIso(OPENING.closeMinutes),
} as const;

export const CONTACT = {
  city: "Saint-Quentin",
  postalCode: "02100",
  region: "Hauts-de-France",
  /** Email public de la maison — affiché pour les questions et demandes de
   *  remboursement (page de confirmation de paiement, facture d'acompte). */
  emailPublic: "maisonkanali@gmail.com",
  /** « Lundi – Samedi · 10h00 – 18h00 » — dérivé de OPENING. */
  scheduleLabel: `Lundi – Samedi · ${toFr(OPENING.openMinutes)} – ${toFr(OPENING.closeMinutes)}`,
  /** Ligne « jours » et ligne « heures » séparées (page À propos). */
  scheduleDays: "Lundi – Samedi",
  scheduleHours: `${toFr(OPENING.openMinutes)} – ${toFr(OPENING.closeMinutes)}`,
  instagramKandylove: "kandylovebeauty",
  instagramNaftali: "naf.lashes",
  facebookKandylove: "Candynails",
} as const;

/**
 * Identité légale de la maison — source unique pour les mentions légales,
 * les CGV et la facture d'acompte PDF (docs/PAIEMENT.md).
 *
 * Renseignée le 18/09/2026 par Gradi : la structure est une **association
 * loi 1901 à but non lucratif**, déclarée en préfecture de l'Aisne.
 * Modifier ces valeurs ici suffit : les trois pages et le PDF suivent.
 */
export const LEGAL = {
  /** Nom exact déclaré en préfecture (récépissé W023006110). */
  businessName: "Maison Kanali",
  /** Forme juridique, affichée telle quelle. */
  legalForm: "Association loi 1901 à but non lucratif",
  /** Numéro RNA (Répertoire National des Associations). */
  rna: "W023006110",
  /** SIRET (14 chiffres) — identifie l'établissement auprès de l'INSEE. */
  siret: "98294433200013" as string | null,
  /** Siège social — obligatoire sur une facture et en mentions légales. */
  address: "19 chemin d'Harly, 02100 Saint-Quentin" as string | null,
  /** Pays du siège : détermine le droit applicable (cf. CGV). */
  country: "France",
  /** Franchise en base : l'association ne facture pas de TVA. La mention est
   *  légalement obligatoire sur chaque facture émise. */
  vatNote: "TVA non applicable — article 293 B du CGI" as string | null,
  /** Représentante légale & directrice de la publication. */
  representative: "Viminde Kandy",
} as const;

export const SITE = {
  name: "Maison Kanali",
  tagline: "Showroom beauté & centre de formation",
  description:
    "Maison Kanali, showroom beauté sur rendez-vous à Saint-Quentin : prothésie ongulaire et maquillage par Kandylove Beauty, extensions de cils par Naftali, et formations professionnelles.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maison-kanali.vercel.app",
} as const;
