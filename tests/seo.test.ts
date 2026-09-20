import { describe, expect, it } from "vitest";
import { PAGES, pageMetadata, STRUCTURED_DATA } from "../lib/seo";

/**
 * Référencement (lib/seo.ts) — ce que Google et les aperçus de partage
 * (WhatsApp, Instagram, Facebook) lisent de chaque page publique.
 */

const pages = Object.values(PAGES);

describe("PAGES", () => {
  it("donne à chaque page un titre et une description qui lui sont propres", () => {
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
    expect(new Set(pages.map((page) => page.description)).size).toBe(pages.length);
  });

  it("tient chaque description dans l'extrait de Google (160 caractères)", () => {
    for (const page of pages) {
      expect(page.description.length, page.path).toBeLessThanOrEqual(160);
    }
  });

  it("place la prestation et la ville dans le titre des pages de prestations", () => {
    for (const page of [PAGES.accueil, PAGES.kandylove, PAGES.naftali, PAGES.formations]) {
      expect(page.title, page.path).toContain("Saint-Quentin");
    }
  });
});

describe("pageMetadata", () => {
  /* Next.js n'applique pas le gabarit « %s — Maison Kanali » à l'accueil,
     qui partage son segment avec app/layout.tsx : le titre doit être complet. */
  it("donne le titre complet, nom de la maison compris, même à l'accueil", () => {
    expect(pageMetadata(PAGES.accueil).title).toEqual({
      absolute: "Ongles, cils & maquillage à Saint-Quentin — Maison Kanali",
    });
  });

  it("déclare l'adresse canonique de la page", () => {
    expect(pageMetadata(PAGES.naftali).alternates?.canonical).toBe("/naftali");
  });

  it("donne à l'aperçu de partage le titre, le texte et l'adresse de la page", () => {
    const og = pageMetadata(PAGES.naftali).openGraph;
    expect(og?.title).toBe(`${PAGES.naftali.title} — Maison Kanali`);
    expect(og?.description).toBe(PAGES.naftali.description);
    expect(og?.url).toBe("/naftali");
    expect(og?.images).toEqual([{ url: "/images/og.jpg", width: 1200, height: 630 }]);
  });
});

describe("STRUCTURED_DATA", () => {
  const graph = STRUCTURED_DATA["@graph"] as Record<string, unknown>[];
  const node = (type: string) => graph.find((item) => item["@type"] === type);

  it("nomme le site pour l'affichage dans les résultats Google", () => {
    expect(node("WebSite")?.name).toBe("Maison Kanali");
  });

  it("situe le salon à Saint-Quentin, code postal compris", () => {
    expect(node("BeautySalon")?.address).toMatchObject({
      addressLocality: "Saint-Quentin",
      postalCode: "02100",
    });
  });
});
