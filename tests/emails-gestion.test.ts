import { describe, expect, it } from "vitest";
import { buildCancellationEmail, buildRescheduleEmail } from "../lib/email";

/** Emails de l'espace de gestion — contenus purs, sans envoi. */

describe("buildCancellationEmail", () => {
  const base = {
    reference: "MK-ABC123",
    serviceName: "Pose gel complète",
    date: "2026-09-10",
    time: "14:00",
    firstName: "Aïcha",
    email: "aicha@example.com",
    depositPaid: false,
  };

  it("annonce la date, l'heure et la référence, et invite à re-réserver", () => {
    const email = buildCancellationEmail(base);
    expect(email.subject).toContain("annulé");
    expect(email.subject).toContain("MK-ABC123");
    expect(email.html).toContain("jeudi 10 septembre 2026");
    expect(email.html).toContain("14h00");
    expect(email.html).toContain("maisonkanali.fr/rendez-vous");
    /* Règle de la maison : jamais « résa ». */
    expect(email.html).not.toMatch(/résa[^t]/i);
  });

  it("sans acompte payé : pas de bloc remboursement", () => {
    const email = buildCancellationEmail(base);
    expect(email.html).not.toContain("remboursement");
  });

  it("acompte payé : indique le contact pour le remboursement", () => {
    const email = buildCancellationEmail({ ...base, depositPaid: true });
    expect(email.html).toContain("remboursement");
    expect(email.html).toContain("maisonkanali@gmail.com");
  });

  it("échappe le HTML des champs libres", () => {
    const email = buildCancellationEmail({
      ...base,
      firstName: "<script>x</script>",
    });
    expect(email.html).not.toContain("<script>x</script>");
    expect(email.html).toContain("&lt;script&gt;");
  });
});

describe("buildRescheduleEmail", () => {
  const base = {
    reference: "MK-ABC123",
    serviceName: "Volume russe",
    brandLabel: "Naftali",
    price: "70 €",
    durationMin: 120,
    date: "2026-09-12",
    time: "10:00",
    endTime: "12:00",
    firstName: "Aïcha",
    lastName: "Diallo",
    email: "aicha@example.com",
    phone: "06 12 34 56 78",
    previousDate: "2026-09-10",
    previousTime: "14:00",
  };

  it("rappelle l'ancien créneau et affiche le nouveau ticket", () => {
    const email = buildRescheduleEmail(base);
    expect(email.subject).toContain("déplacé");
    expect(email.subject).toContain("samedi 12 septembre 2026");
    expect(email.html).toContain("jeudi 10 septembre 2026");
    expect(email.html).toContain("Ticket de rendez-vous");
    expect(email.html).toContain("10h00");
    expect(email.html).toContain("12h00");
  });

  it("fournit une invitation calendrier au nouvel horaire", () => {
    const email = buildRescheduleEmail(base);
    expect(email.ics).toContain("BEGIN:VCALENDAR");
    expect(email.ics).toContain("20260912");
  });

  it("acompte réglé : le ticket le rappelle", () => {
    const email = buildRescheduleEmail({
      ...base,
      deposit: {
        paidLabel: "20 €",
        remainderLabel: "50 €",
        invoiceNumber: "FA-2026-0001",
        issuedOn: "2026-09-01",
      },
    });
    expect(email.html).toContain("Acompte réglé en ligne");
    expect(email.html).toContain("Reste sur place");
  });
});
