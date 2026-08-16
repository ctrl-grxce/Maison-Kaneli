import { CONTACT, SITE } from "./config";

/**
 * Invitation calendrier (.ics) jointe à l'email de confirmation :
 * la cliente ajoute son rendez-vous à Google Agenda / Apple / Outlook
 * en un geste, avec un rappel automatique la veille.
 *
 * Les horaires sont exprimés en heure de Paris via un bloc VTIMEZONE
 * standard (règles CET/CEST) — aucun calcul de décalage nécessaire.
 */

interface BookingIcsData {
  reference: string;
  serviceName: string;
  /** AAAA-MM-JJ */
  date: string;
  /** HH:MM (heure de Paris) */
  startTime: string;
  /** HH:MM (heure de Paris) */
  endTime: string;
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** Plie les lignes à 74 caractères (RFC 5545 §3.1). */
function fold(line: string): string {
  if (line.length <= 74) return line;
  const parts: string[] = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length > 73) {
    parts.push(" " + rest.slice(0, 73));
    rest = rest.slice(73);
  }
  if (rest) parts.push(" " + rest);
  return parts.join("\r\n");
}

export function buildBookingIcs(data: BookingIcsData): string {
  const compact = (time: string) =>
    `${data.date.replace(/-/g, "")}T${time.replace(":", "")}00`;
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maison Kanali//Reservation//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/Paris",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0200",
    "TZNAME:CEST",
    "DTSTART:19700329T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0200",
    "TZOFFSETTO:+0100",
    "TZNAME:CET",
    "DTSTART:19701025T030000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${data.reference}@maison-kanali.vercel.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Paris:${compact(data.startTime)}`,
    `DTEND;TZID=Europe/Paris:${compact(data.endTime)}`,
    `SUMMARY:${icsEscape(`${SITE.name} — ${data.serviceName}`)}`,
    `DESCRIPTION:${icsEscape(
      `Référence ${data.reference}. Un empêchement ? Répondez simplement à l'email de confirmation.`,
    )}`,
    `LOCATION:${icsEscape(`${SITE.name}, ${CONTACT.city}`)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(`Rendez-vous ${SITE.name} demain`)}`,
    "TRIGGER:-P1D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(fold).join("\r\n");
}
