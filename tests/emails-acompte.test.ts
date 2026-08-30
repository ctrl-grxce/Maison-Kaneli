import { describe, expect, it } from "vitest";
import { buildBookingEmails } from "../lib/email";

/**
 * Gabarits d'emails avec et sans acompte (docs/PAIEMENT.md).
 * Gabarits purs : aucun email n'est envoyé par ces tests.
 */

const BASE = {
  reference: "MK-TEST01",
  serviceName: "Volume russe",
  brandLabel: "Naftali",
  price: "40 € · offre jusqu'à fin octobre",
  durationMin: 150,
  date: "2026-09-10",
  time: "14:00",
  endTime: "16:30",
  firstName: "Sarah",
  lastName: "Exemple",
  email: "sarah@example.com",
  phone: "+33 6 12 34 56 78",
};

describe("buildBookingEmails — sans acompte (circuit historique)", () => {
  const emails = buildBookingEmails(BASE);

  it("garde les sujets historiques", () => {
    expect(emails.manager.subject).toContain("Nouveau rendez-vous");
    expect(emails.client.subject).toContain("Votre rendez-vous du");
    expect(emails.client.subject).not.toContain("confirmé");
  });

  it("ne parle nulle part d'acompte", () => {
    expect(emails.manager.html).not.toContain("Acompte");
    expect(emails.client.html).not.toContain("Acompte");
    expect(emails.client.html).not.toContain("facture");
  });
});

describe("buildBookingEmails — avec acompte réglé", () => {
  const emails = buildBookingEmails({
    ...BASE,
    deposit: {
      paidLabel: "20 €",
      remainderLabel: "20 €",
      invoiceNumber: "FA-2026-0001",
      issuedOn: "2026-09-01",
    },
  });

  it("annonce la confirmation dans les sujets", () => {
    expect(emails.manager.subject).toContain("acompte réglé");
    expect(emails.client.subject).toContain("est confirmé");
  });

  it("affiche l'acompte et le reste dans les deux emails", () => {
    for (const html of [emails.manager.html, emails.client.html]) {
      expect(html).toContain("Acompte réglé en ligne");
      expect(html).toContain("20 €");
      expect(html).toContain("Reste sur place");
    }
  });

  it("mentionne la facture d'acompte et son numéro", () => {
    expect(emails.manager.html).toContain("FA-2026-0001");
    expect(emails.client.html).toContain("FA-2026-0001");
    expect(emails.client.html).toContain("facture d'acompte");
  });

  it("garde l'invitation calendrier", () => {
    expect(emails.client.ics).toContain("BEGIN:VCALENDAR");
  });
});

describe("buildBookingEmails — acompte sans reste calculable (« Sur demande »)", () => {
  const emails = buildBookingEmails({
    ...BASE,
    price: "Sur demande",
    deposit: {
      paidLabel: "20 €",
      remainderLabel: null,
      invoiceNumber: "FA-2026-0002",
      issuedOn: "2026-09-01",
    },
  });

  it("affiche l'acompte mais pas de ligne « Reste sur place »", () => {
    expect(emails.client.html).toContain("Acompte réglé en ligne");
    expect(emails.client.html).not.toContain("Reste sur place");
  });
});
