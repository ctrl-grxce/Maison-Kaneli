import { describe, expect, it } from "vitest";
import { buildSlots, isBookableStart, timeToMinutes } from "../lib/availability";

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
