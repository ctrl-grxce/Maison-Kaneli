import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import { formatDateFr, formatTimeFr } from "./utils";
import { CONTACT, LEGAL } from "./config";

/**
 * Facture d'acompte PDF — jointe aux emails de confirmation dès que
 * l'acompte est payé en ligne (docs/PAIEMENT.md).
 *
 * Numérotation continue (FA-2026-0001…) attribuée par la base au moment de
 * la confirmation du paiement. Les coordonnées légales viennent de
 * `LEGAL` (lib/config.ts) — tant qu'elles sont incomplètes, la facture le
 * signale et le paiement réel ne doit pas être allumé.
 */

export interface FactureData {
  /** Numéro officiel, ex. « FA-2026-0001 ». */
  invoiceNumber: string;
  /** Référence de la réservation, ex. « MK-A1B2C3 ». */
  reference: string;
  serviceName: string;
  brandLabel: string;
  firstName: string;
  lastName: string;
  /** Date du rendez-vous (AAAA-MM-JJ) + heure de début (HH:MM). */
  date: string;
  time: string;
  /** Date d'émission = date du paiement (AAAA-MM-JJ). */
  issuedOn: string;
  /** Libellé du tarif total (« 40 € », « 40 € · offre… », « Sur demande »). */
  priceLabel: string;
  /** Acompte réglé en ligne, ex. « 20 € ». */
  depositLabel: string;
  /** Reste à régler sur place, ou null si le tarif n'est pas un montant fixe. */
  remainderLabel: string | null;
}

/* Charte Maison Kanali — mêmes teintes que le ticket de réservation. */
const BRONZE: RGB = rgb(0.663, 0.455, 0.31); // #a9744f
const ESPRESSO: RGB = rgb(0.18, 0.141, 0.11); // #2e241c
const TAUPE: RGB = rgb(0.502, 0.439, 0.373); // #80705f
const IVORY: RGB = rgb(0.992, 0.984, 0.969); // #fdfbf7
const SAND: RGB = rgb(0.906, 0.863, 0.8); // #e7dccc
const WHITE: RGB = rgb(1, 1, 1);

/** Page format A5 portrait, comme le ticket. */
const WIDTH = 420;
const HEIGHT = 595;
const INSET = 24;

function drawCentered(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color: RGB,
): void {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (WIDTH - w) / 2, y, size, font, color });
}

function drawRight(
  page: PDFPage,
  text: string,
  xRight: number,
  y: number,
  font: PDFFont,
  size: number,
  color: RGB,
): void {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: xRight - w, y, size, font, color });
}

/** Espace les lettres à la main (pdf-lib n'a pas de letter-spacing). */
function spaced(text: string): string {
  return text.split("").join(" ");
}

export async function buildFacturePdf(data: FactureData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Facture d'acompte ${data.invoiceNumber} — Maison Kanali`);
  doc.setAuthor("Maison Kanali");

  const page = doc.addPage([WIDTH, HEIGHT]);
  const times = await doc.embedFont(StandardFonts.TimesRoman);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);

  /* — Fond + cadre — */
  page.drawRectangle({ x: 0, y: 0, width: WIDTH, height: HEIGHT, color: IVORY });
  page.drawRectangle({
    x: INSET,
    y: INSET,
    width: WIDTH - INSET * 2,
    height: HEIGHT - INSET * 2,
    borderColor: SAND,
    borderWidth: 1,
  });

  /* — En-tête marque — */
  const brand = "Maison";
  const brandRest = spaced("KANALI");
  const brandSize = 24;
  const wItalic = timesItalic.widthOfTextAtSize(brand, brandSize);
  const wRest = times.widthOfTextAtSize(` ${brandRest}`, brandSize);
  const brandX = (WIDTH - wItalic - wRest) / 2;
  let y = HEIGHT - 78;
  page.drawText(brand, { x: brandX, y, size: brandSize, font: timesItalic, color: BRONZE });
  page.drawText(` ${brandRest}`, { x: brandX + wItalic, y, size: brandSize, font: times, color: BRONZE });
  y -= 20;
  drawCentered(page, spaced("SHOWROOM BEAUTÉ · SAINT-QUENTIN"), y, helvetica, 6.5, TAUPE);

  /* — Bandeau bronze : titre + numéro — */
  const bandTop = y - 18;
  const bandHeight = 64;
  page.drawRectangle({
    x: INSET,
    y: bandTop - bandHeight,
    width: WIDTH - INSET * 2,
    height: bandHeight,
    color: BRONZE,
  });
  drawCentered(page, spaced("FACTURE D'ACOMPTE"), bandTop - 24, helvetica, 8, IVORY);
  drawCentered(page, spaced(data.invoiceNumber), bandTop - 50, timesBold, 20, WHITE);

  /* — Lignes de détail — */
  const rows: [string, string][] = [
    ["DATE D'ÉMISSION", formatDateFr(data.issuedOn)],
    ["RÉSERVATION", data.reference],
    ["CLIENTE", `${data.firstName} ${data.lastName}`],
    ["PRESTATION", data.serviceName],
    ["PÔLE", data.brandLabel],
    [
      "RENDEZ-VOUS",
      `${formatDateFr(data.date)} · ${formatTimeFr(data.time)}`,
    ],
  ];

  const left = INSET + 22;
  const right = WIDTH - INSET - 22;
  y = bandTop - bandHeight - 36;
  for (const [label, value] of rows) {
    page.drawText(spaced(label), { x: left, y, size: 7, font: helvetica, color: TAUPE });
    drawRight(page, value, right, y - 1, times, 12, ESPRESSO);
    y -= 13;
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness: 0.6,
      color: SAND,
    });
    y -= 19;
  }

  /* — Montants — */
  y -= 2;
  page.drawText(spaced("TARIF DE LA PRESTATION"), { x: left, y, size: 7, font: helvetica, color: TAUPE });
  drawRight(page, data.priceLabel, right, y - 2, times, 12, ESPRESSO);
  y -= 24;
  page.drawText(spaced("ACOMPTE RÉGLÉ EN LIGNE"), { x: left, y, size: 7, font: helvetica, color: TAUPE });
  drawRight(page, data.depositLabel, right, y - 4, timesBold, 16, BRONZE);
  y -= 24;
  if (data.remainderLabel) {
    page.drawText(spaced("RESTE À RÉGLER SUR PLACE"), { x: left, y, size: 7, font: helvetica, color: TAUPE });
    drawRight(page, data.remainderLabel, right, y - 2, times, 12, ESPRESSO);
    y -= 20;
  }
  page.drawText("Acompte réglé par carte bancaire en ligne (Stripe) —", {
    x: left,
    y,
    size: 7.5,
    font: helvetica,
    color: TAUPE,
  });
  y -= 11;
  page.drawText("il sera déduit du montant total le jour du rendez-vous.", {
    x: left,
    y,
    size: 7.5,
    font: helvetica,
    color: TAUPE,
  });

  /* — Séparation pointillée — */
  y -= 22;
  page.drawLine({
    start: { x: INSET + 10, y },
    end: { x: WIDTH - INSET - 10, y },
    thickness: 0.8,
    color: BRONZE,
    dashArray: [3, 4],
  });

  /* — Pied : coordonnées légales — */
  y -= 24;
  drawCentered(page, LEGAL.businessName, y, timesBold, 10.5, ESPRESSO);
  y -= 14;
  drawCentered(
    page,
    LEGAL.address ?? `${CONTACT.city} (${CONTACT.region})`,
    y,
    times,
    9,
    TAUPE,
  );
  y -= 13;
  drawCentered(
    page,
    LEGAL.siret ? `SIRET : ${LEGAL.siret}` : "SIRET : à compléter",
    y,
    helvetica,
    7.5,
    TAUPE,
  );
  if (LEGAL.vatNote) {
    y -= 12;
    drawCentered(page, LEGAL.vatNote, y, helvetica, 7.5, TAUPE);
  }
  y -= 16;
  drawCentered(
    page,
    "Facture générée automatiquement à la confirmation du paiement.",
    y,
    times,
    8.5,
    TAUPE,
  );

  return doc.save();
}
