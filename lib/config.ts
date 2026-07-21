/**
 * Paramètres d'ouverture du showroom.
 * Source : business plan Maison Kanali — du lundi au samedi, 10h00 – 17h00.
 */
export const OPENING = {
  /** Jours ouvrés (0 = dimanche … 6 = samedi). */
  openDays: [1, 2, 3, 4, 5, 6],
  /** Ouverture, en minutes depuis minuit (10h00). */
  openMinutes: 10 * 60,
  /** Fermeture, en minutes depuis minuit (17h00). */
  closeMinutes: 17 * 60,
  /** Pas entre deux débuts de créneaux, en minutes. */
  slotStepMinutes: 30,
  /** Délai minimal avant un rendez-vous (réservation le jour même), en minutes. */
  minLeadMinutes: 90,
  /** Horizon de réservation, en jours. */
  horizonDays: 60,
} as const;

export const CONTACT = {
  city: "Saint-Quentin",
  region: "Hauts-de-France",
  scheduleLabel: "Lundi – Samedi · 10h00 – 17h00",
  instagramKandylove: "kandylovebeauty",
  instagramNaftali: "naftali.lashes",
  facebookKandylove: "Candynails",
} as const;

export const SITE = {
  name: "Maison Kanali",
  tagline: "Showroom beauté & centre de formation",
  description:
    "Maison Kanali, showroom beauté sur rendez-vous à Saint-Quentin : prothésie ongulaire et maquillage par Kandylove Beauty, extensions de cils par Naftali, et formations professionnelles.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://maison-kanali.vercel.app",
} as const;
