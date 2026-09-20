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

describe("buildSlots", () => {
  it("propose un départ toutes les 30 min, de 10h00 à 17h00", () => {
    const slots = departs(60);
    expect(slots[0]).toBe("10:00");
    expect(slots.at(-1)).toBe("17:00");
    expect(slots).toHaveLength(15);
  });

  it("propose 17h00 même quand la prestation finit après 18h", () => {
    expect(departs(150).at(-1)).toBe("17:00");
  });

  it("ne propose rien après 17h00, même pour une prestation courte", () => {
    expect(departs(30).at(-1)).toBe("17:00");
  });

  it("ferme les départs qui chevauchent un rendez-vous finissant après 18h", () => {
    const taken = [{ startMin: timeToMinutes("17:00"), endMin: timeToMinutes("19:30") }];
    const slots = buildSlots(LUNDI, 60, taken, LA_VEILLE);
    const libre = (time: string) => slots.find((slot) => slot.time === time)?.available;
    expect(libre("16:00")).toBe(true);
    expect(libre("16:30")).toBe(false);
    expect(libre("17:00")).toBe(false);
  });
});

/* Règle appliquée par le serveur à la réservation et au déplacement. */
describe("isBookableStart", () => {
  it("accepte l'ouverture et le dernier départ de 17h00", () => {
    expect(isBookableStart(timeToMinutes("10:00"))).toBe(true);
    expect(isBookableStart(timeToMinutes("17:00"))).toBe(true);
  });

  it("refuse avant l'ouverture et après 17h00", () => {
    expect(isBookableStart(timeToMinutes("09:30"))).toBe(false);
    expect(isBookableStart(timeToMinutes("17:30"))).toBe(false);
  });

  it("refuse un horaire hors de la grille de 30 min", () => {
    expect(isBookableStart(timeToMinutes("10:15"))).toBe(false);
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
