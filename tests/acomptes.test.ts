import { describe, expect, it } from "vitest";
import {
  SERVICES,
  depositCentsFor,
  formatEuros,
  parsePriceCents,
  remainderLabelFor,
} from "../lib/services";

/**
 * Tests des calculs d'acompte (docs/PAIEMENT.md).
 * Montants décidés le 30/08/2026 : ongles 20 € · maquillage 30 € · cils 20 €,
 * et la dépose sans acompte.
 */

describe("depositCentsFor", () => {
  it("demande 20 € d'acompte pour les prestations ongles", () => {
    const ongles = SERVICES.filter((s) => s.category === "ongles");
    expect(ongles.length).toBeGreaterThan(0);
    for (const service of ongles) {
      expect(depositCentsFor(service)).toBe(2000);
    }
  });

  it("demande 30 € d'acompte pour le maquillage (hors mariée)", () => {
    const maquillage = SERVICES.filter(
      (s) => s.category === "maquillage" && !s.id.startsWith("mariee-"),
    );
    expect(maquillage.length).toBeGreaterThan(0);
    for (const service of maquillage) {
      expect(depositCentsFor(service)).toBe(3000);
    }
  });

  it("ne demande PAS d'acompte pour les prestations mariées (sur devis à venir)", () => {
    for (const id of ["mariee-essai", "mariee-jour-j"]) {
      const service = SERVICES.find((s) => s.id === id);
      expect(service).toBeDefined();
      expect(depositCentsFor(service!)).toBe(0);
    }
  });

  it("demande 20 € d'acompte pour les poses de cils", () => {
    const poses = SERVICES.filter(
      (s) => s.category === "cils" && s.id !== "depose-cils",
    );
    expect(poses.length).toBeGreaterThan(0);
    for (const service of poses) {
      expect(depositCentsFor(service)).toBe(2000);
    }
  });

  it("ne demande AUCUN acompte pour la dépose (tout se règle sur place)", () => {
    const depose = SERVICES.find((s) => s.id === "depose-cils");
    expect(depose).toBeDefined();
    expect(depositCentsFor(depose!)).toBe(0);
  });
});

describe("formatEuros", () => {
  it("affiche les montants ronds sans centimes", () => {
    expect(formatEuros(2000)).toBe("20 €");
    expect(formatEuros(3000)).toBe("30 €");
    expect(formatEuros(500)).toBe("5 €");
  });

  it("affiche les centimes quand il y en a", () => {
    expect(formatEuros(2050)).toBe("20,50 €");
    expect(formatEuros(1999)).toBe("19,99 €");
    expect(formatEuros(1905)).toBe("19,05 €");
  });
});

describe("parsePriceCents", () => {
  it("lit les tarifs simples", () => {
    expect(parsePriceCents("35 €")).toBe(3500);
    expect(parsePriceCents("60 €")).toBe(6000);
  });

  it("lit les libellés avec mention de promo", () => {
    expect(parsePriceCents("40 € · offre jusqu'à fin octobre")).toBe(4000);
  });

  it("renvoie null pour les tarifs non fixes", () => {
    expect(parsePriceCents("Sur demande")).toBeNull();
    expect(parsePriceCents("À partir de 50 €")).toBeNull();
  });
});

describe("remainderLabelFor", () => {
  it("calcule le reste à régler sur place", () => {
    expect(remainderLabelFor("40 €", 2000)).toBe("20 €");
    expect(remainderLabelFor("45 €", 2000)).toBe("25 €");
    expect(remainderLabelFor("40 € · offre jusqu'à fin octobre", 2000)).toBe(
      "20 €",
    );
  });

  it("renvoie null quand le tarif n'est pas un montant fixe", () => {
    expect(remainderLabelFor("Sur demande", 2000)).toBeNull();
  });

  it("renvoie null si le tarif est inférieur à l'acompte (garde-fou)", () => {
    expect(remainderLabelFor("15 €", 2000)).toBeNull();
  });
});
