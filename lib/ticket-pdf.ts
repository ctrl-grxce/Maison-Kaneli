import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import { formatDateFr, formatTimeFr, formatDuration } from "./utils";

/**
 * Ticket de réservation PDF, joint à l'email de confirmation de la cliente.
 *
 * En attendant le paiement en ligne, il tient lieu de reçu de réservation —
 * ce n'est PAS une facture (une vraie facture exigera SIRET, numérotation…
 * elle viendra avec le module de paiement, phase 2).
 */

interface TicketData {
  reference: string;
  serviceName: string;
  brandLabel: string;
  price: string;
  durationMin: number;
  date: string;
  time: string;
  endTime: string;
  firstName: string;
  lastName: string;
}

/* Charte Maison Kanali, convertie depuis les hex du site. */
const BRONZE: RGB = rgb(0.663, 0.455, 0.31); // #a9744f
const ESPRESSO: RGB = rgb(0.18, 0.141, 0.11); // #2e241c
const TAUPE: RGB = rgb(0.502, 0.439, 0.373); // #80705f
const IVORY: RGB = rgb(0.992, 0.984, 0.969); // #fdfbf7
const SAND: RGB = rgb(0.906, 0.863, 0.8); // #e7dccc
const WHITE: RGB = rgb(1, 1, 1);

/** Page format A5 portrait. */
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

export async function buildTicketPdf(data: TicketData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Ticket de réservation ${data.reference} — Maison Kanali`);
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

  /* — Bandeau bronze : titre + référence — */
  const bandTop = y - 18;
  const bandHeight = 64;
  page.drawRectangle({
    x: INSET,
    y: bandTop - bandHeight,
    width: WIDTH - INSET * 2,
    height: bandHeight,
    color: BRONZE,
  });
  drawCentered(page, spaced("TICKET DE RÉSERVATION"), bandTop - 24, helvetica, 8, IVORY);
  drawCentered(page, spaced(data.reference), bandTop - 50, timesBold, 20, WHITE);

  /* — Lignes de détail — */
  const rows: [string, string][] = [
    ["CLIENTE", `${data.firstName} ${data.lastName}`],
    ["PRESTATION", data.serviceName],
    ["PÔLE", data.brandLabel],
    ["DATE", formatDateFr(data.date)],
    ["HEURE", `${formatTimeFr(data.time)} – ${formatTimeFr(data.endTime)}`],
    ["DURÉE", formatDuration(data.durationMin)],
  ];

  const left = INSET + 22;
  const right = WIDTH - INSET - 22;
  y = bandTop - bandHeight - 40;
  for (const [label, value] of rows) {
    page.drawText(spaced(label), { x: left, y, size: 7, font: helvetica, color: TAUPE });
    drawRight(page, value, right, y - 1, times, 12.5, ESPRESSO);
    y -= 14;
    page.drawLine({
      start: { x: left, y },
      end: { x: right, y },
      thickness: 0.6,
      color: SAND,
    });
    y -= 22;
  }

  /* — Total — */
  y -= 4;
  page.drawText(spaced("TARIF"), { x: left, y, size: 7, font: helvetica, color: TAUPE });
  drawRight(page, data.price, right, y - 4, timesBold, 16, BRONZE);
  y -= 20;
  page.drawText("À régler sur place — ce ticket ne vaut pas facture.", {
    x: left,
    y,
    size: 7.5,
    font: helvetica,
    color: TAUPE,
  });

  /* — Séparation pointillée façon billet — */
  y -= 26;
  page.drawLine({
    start: { x: INSET + 10, y },
    end: { x: WIDTH - INSET - 10, y },
    thickness: 0.8,
    color: BRONZE,
    dashArray: [3, 4],
  });

  /* — Pied de billet — */
  y -= 26;
  drawCentered(page, "Présentez ce ticket (ou votre référence) à votre arrivée.", y, times, 10.5, ESPRESSO);
  y -= 18;
  drawCentered(page, spaced("LUNDI – SAMEDI · 10H00 – 17H00"), y, helvetica, 6.5, TAUPE);
  y -= 12;
  drawCentered(page, spaced("SAINT-QUENTIN · SUR RENDEZ-VOUS"), y, helvetica, 6.5, TAUPE);
  y -= 20;
  drawCentered(
    page,
    "Un empêchement ? Répondez simplement à l'email de confirmation.",
    y,
    times,
    8.5,
    TAUPE,
  );

  return doc.save();
}
