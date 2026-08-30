import { describe, expect, it } from "vitest";
import { buildFacturePdf } from "../lib/facture-pdf";
import { buildTicketPdf } from "../lib/ticket-pdf";

/** Les deux PDF se génèrent sans erreur et ressemblent à de vrais PDF. */

function looksLikePdf(bytes: Uint8Array): boolean {
  const header = String.fromCharCode(...bytes.slice(0, 5));
  return header === "%PDF-" && bytes.length > 1000;
}

describe("buildFacturePdf", () => {
  it("génère une facture d'acompte valide", async () => {
    const bytes = await buildFacturePdf({
      invoiceNumber: "FA-2026-0001",
      reference: "MK-TEST01",
      serviceName: "Volume russe",
      brandLabel: "Naftali",
      firstName: "Sarah",
      lastName: "Exemple",
      date: "2026-09-10",
      time: "14:00",
      issuedOn: "2026-09-01",
      priceLabel: "40 € · offre jusqu'à fin octobre",
      depositLabel: "20 €",
      remainderLabel: "20 €",
    });
    expect(looksLikePdf(bytes)).toBe(true);
  });

  it("supporte un tarif « Sur demande » (pas de ligne reste)", async () => {
    const bytes = await buildFacturePdf({
      invoiceNumber: "FA-2026-0002",
      reference: "MK-TEST02",
      serviceName: "Maquillage jour J",
      brandLabel: "Kandylove Beauty",
      firstName: "Léa",
      lastName: "Exemple",
      date: "2026-09-12",
      time: "10:00",
      issuedOn: "2026-09-01",
      priceLabel: "Sur demande",
      depositLabel: "30 €",
      remainderLabel: null,
    });
    expect(looksLikePdf(bytes)).toBe(true);
  });
});

describe("buildTicketPdf avec acompte", () => {
  it("génère le ticket avec le bloc acompte", async () => {
    const bytes = await buildTicketPdf({
      reference: "MK-TEST01",
      serviceName: "Volume russe",
      brandLabel: "Naftali",
      price: "40 €",
      durationMin: 150,
      date: "2026-09-10",
      time: "14:00",
      endTime: "16:30",
      firstName: "Sarah",
      lastName: "Exemple",
      deposit: { paidLabel: "20 €", remainderLabel: "20 €" },
    });
    expect(looksLikePdf(bytes)).toBe(true);
  });

  it("reste identique sans acompte (circuit historique)", async () => {
    const bytes = await buildTicketPdf({
      reference: "MK-TEST03",
      serviceName: "Gainage + semi",
      brandLabel: "Kandylove Beauty",
      price: "45 €",
      durationMin: 90,
      date: "2026-09-11",
      time: "11:00",
      endTime: "12:30",
      firstName: "Emma",
      lastName: "Exemple",
    });
    expect(looksLikePdf(bytes)).toBe(true);
  });
});
