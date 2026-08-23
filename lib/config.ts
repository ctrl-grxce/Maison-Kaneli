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
  /** Fermeture, en minutes depuis minuit (18h00). Une prestation doit se
   *  terminer au plus tard à cette heure (cf. lib/availability.ts). */
  closeMinutes: 18 * 60,
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
  region: "Hauts-de-France",
  /** « Lundi – Samedi · 10h00 – 18h00 » — dérivé de OPENING. */
  scheduleLabel: `Lundi – Samedi · ${toFr(OPENING.openMinutes)} – ${toFr(OPENING.closeMinutes)}`,
  /** Ligne « jours » et ligne « heures » séparées (page À propos). */
  scheduleDays: "Lundi – Samedi",
  scheduleHours: `${toFr(OPENING.openMinutes)} – ${toFr(OPENING.closeMinutes)}`,
  instagramKandylove: "kandylovebeauty",
  instagramNaftali: "naf.lashes",
  facebookKandylove: "Candynails",
} as const;

export const SITE = {
  name: "Maison Kanali",
  tagline: "Showroom beauté & centre de formation",
  description:
    "Maison Kanali, showroom beauté sur rendez-vous à Saint-Quentin : prothésie ongulaire et maquillage par Kandylove Beauty, extensions de cils par Naftali, et formations professionnelles.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maison-kanali.vercel.app",
} as const;
