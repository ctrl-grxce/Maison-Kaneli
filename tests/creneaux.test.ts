import { describe, expect, it } from "vitest";
import {
  addDays,
  buildSlots,
  isBookableDate,
  isBookableStart,
  timeToMinutes,
} from "../lib/availability";
import { OPENING } from "../lib/config";

/**
 * Grille des créneaux (lib/availability.ts).
 * Décision des fondatrices du 19/09/2026 : on réserve jusqu'à 17h00 pour
 * TOUTES les prestations, même quand la prestation finit après la
 * fermeture de 18h (un volume russe de 2h30 posé à 17h finit à 19h30).
 */

const LUNDI = "2026-09-21";
/* « Maintenant » la veille : le délai minimal du jour même ne joue pas. */
const LA_VEILLE = { date: "2026-09-20", minutes: 12 * 60 };

function departs(durationMin: number): string[] {
  return buildSlots(LUNDI, durationMin, [], LA_VEILLE).map((slot) => slot.time);
}

/* Départs de JOURNÉE seulement (sans les créneaux tardifs). */
function departsJournee(durationMin: number): string[] {
  return buildSlots(LUNDI, durationMin, [], LA_VEILLE)
    .filter((slot) => !slot.late)
    .map((slot) => slot.time);
}

function departsTardifs(durationMin: number): string[] {
  return buildSlots(LUNDI, durationMin, [], LA_VEILLE)
    .filter((slot) => slot.late)
    .map((slot) => slot.time);
}

describe("buildSlots — journée", () => {
  it("propose un départ toutes les 30 min, de 10h00 à 17h00", () => {
    const slots = departsJournee(60);
    expect(slots[0]).toBe("10:00");
    expect(slots.at(-1)).toBe("17:00");
    expect(slots).toHaveLength(15);
  });

  it("propose 17h00 même quand la prestation finit après 18h", () => {
    expect(departsJournee(150).at(-1)).toBe("17:00");
  });

  it("ne propose jamais 17h30", () => {
    expect(departs(30)).not.toContain("17:30");
  });

  it("ferme les départs qui chevauchent un rendez-vous finissant après 18h", () => {
    const taken = [{ startMin: timeToMinutes("17:00"), endMin: timeToMinutes("19:30") }];
    const slots = buildSlots(LUNDI, 60, taken, LA_VEILLE);
    const libre = (time: string) => slots.find((slot) => slot.time === time)?.available;
    expect(libre("16:00")).toBe(true);
    expect(libre("16:30")).toBe(false);
    expect(libre("17:00")).toBe(false);
    expect(libre("18:00")).toBe(false);
    expect(libre("19:00")).toBe(false);
  });
});

/* Demande de Gradi du 08/11/2026 : départs à partir de 18h, fin à 20h max,
   supplément de 10 €. */
describe("buildSlots — créneaux tardifs", () => {
  it("propose 18h00 → 19h00 pour une prestation d'1 h", () => {
    expect(departsTardifs(60)).toEqual(["18:00", "18:30", "19:00"]);
  });

  it("propose seulement 18h00 pour une prestation de 2 h", () => {
    expect(departsTardifs(120)).toEqual(["18:00"]);
  });

  it("ne propose aucun créneau tardif si la prestation finirait après 20h", () => {
    expect(departsTardifs(150)).toEqual([]);
  });

  it("marque les créneaux tardifs, et eux seuls", () => {
    const slots = buildSlots(LUNDI, 60, [], LA_VEILLE);
    expect(slots.find((s) => s.time === "17:00")?.late).toBeUndefined();
    expect(slots.find((s) => s.time === "18:00")?.late).toBe(true);
  });

  it("ferme un créneau tardif déjà pris", () => {
    const taken = [{ startMin: timeToMinutes("18:00"), endMin: timeToMinutes("19:00") }];
    const slots = buildSlots(LUNDI, 60, taken, LA_VEILLE);
    const libre = (time: string) => slots.find((slot) => slot.time === time)?.available;
    expect(libre("18:00")).toBe(false);
    expect(libre("18:30")).toBe(false);
    expect(libre("19:00")).toBe(true);
  });
});

/* Règle appliquée par le serveur à la réservation et au déplacement. */
describe("isBookableStart", () => {
  it("accepte l'ouverture et le dernier départ de 17h00", () => {
    expect(isBookableStart(timeToMinutes("10:00"), 60)).toBe(true);
    expect(isBookableStart(timeToMinutes("17:00"), 150)).toBe(true);
  });

  it("refuse avant l'ouverture et 17h30", () => {
    expect(isBookableStart(timeToMinutes("09:30"), 60)).toBe(false);
    expect(isBookableStart(timeToMinutes("17:30"), 30)).toBe(false);
  });

  it("refuse un horaire hors de la grille de 30 min", () => {
    expect(isBookableStart(timeToMinutes("10:15"), 60)).toBe(false);
    expect(isBookableStart(timeToMinutes("18:15"), 30)).toBe(false);
  });

  it("accepte un créneau tardif qui finit à 20h au plus tard", () => {
    expect(isBookableStart(timeToMinutes("18:00"), 120)).toBe(true);
    expect(isBookableStart(timeToMinutes("19:30"), 30)).toBe(true);
  });

  it("refuse un créneau tardif qui finirait après 20h", () => {
    expect(isBookableStart(timeToMinutes("18:30"), 120)).toBe(false);
    expect(isBookableStart(timeToMinutes("20:00"), 30)).toBe(false);
  });
});

/**
 * Horizon de réservation (lib/config.ts).
 * Demande de Gradi du 20/09/2026 : le calendrier s'arrêtait en novembre
 * (60 jours). La fenêtre est désormais glissante sur ~5 ans, donc toute
 * l'année 2030 est réservable.
 */
describe("isBookableDate — horizon", () => {
  /* Un dimanche : la fenêtre part de « aujourd'hui », jour fermé ou non. */
  const AUJOURD_HUI = "2026-09-20";

  it("ouvre la réservation sur toute l'année 2030", () => {
    expect(isBookableDate("2030-01-07", AUJOURD_HUI)).toBe(true); // lundi
    expect(isBookableDate("2030-12-31", AUJOURD_HUI)).toBe(true); // mardi
  });

  it("accepte le dernier jour de la fenêtre et refuse le lendemain", () => {
    const dernier = addDays(AUJOURD_HUI, OPENING.horizonDays); // samedi
    expect(isBookableDate(dernier, AUJOURD_HUI)).toBe(true);
    expect(isBookableDate(addDays(dernier, 2), AUJOURD_HUI)).toBe(false); // lundi
  });

  it("refuse toujours le passé et les dimanches", () => {
    expect(isBookableDate("2026-09-19", AUJOURD_HUI)).toBe(false);
    expect(isBookableDate("2030-01-06", AUJOURD_HUI)).toBe(false); // dimanche
  });
});
