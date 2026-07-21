import { Resend } from "resend";
import { formatDateFr, formatTimeFr, formatDuration } from "./utils";

/**
 * Emails transactionnels de Maison Kanali (via Resend).
 * Sans RESEND_API_KEY, les fonctions se désactivent proprement :
 * la réservation reste enregistrée, seul l'envoi d'email est ignoré.
 */

interface BookingEmailData {
  reference: string;
  serviceName: string;
  brandLabel: string;
  price: string;
  durationMin: number;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

interface FormationEmailData {
  reference: string;
  formationName: string;
  kitOption?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message?: string;
}

const BRONZE = "#a9744f";
const ESPRESSO = "#2e241c";
const TAUPE = "#80705f";
const IVORY = "#fdfbf7";
const SAND = "#e7dccc";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function shell(title: string, intro: string, rows: string, footer: string): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background-color:${IVORY};font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${IVORY};padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:1px solid ${SAND};">
          <tr>
            <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid ${SAND};">
              <div style="font-size:26px;color:${BRONZE};">
                <em>Maison</em>&nbsp;<span style="letter-spacing:6px;">KANALI</span>
              </div>
              <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${TAUPE};padding-top:10px;font-family:Arial,sans-serif;">
                Showroom beauté · Saint-Quentin
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 8px;">
              <div style="font-size:21px;color:${ESPRESSO};padding-bottom:8px;">${title}</div>
              <div style="font-size:14px;line-height:1.7;color:${TAUPE};font-family:Arial,sans-serif;">${intro}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${SAND};background-color:${IVORY};">
                ${rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 36px;">
              <div style="font-size:13px;line-height:1.7;color:${TAUPE};font-family:Arial,sans-serif;">${footer}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 40px;border-top:1px solid ${SAND};text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TAUPE};font-family:Arial,sans-serif;">
                Maison Kanali · Lundi – Samedi · 10h00 – 17h00
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function row(label: string, value: string, strong = false): string {
  return `<tr>
    <td style="padding:11px 18px;border-bottom:1px solid ${SAND};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TAUPE};font-family:Arial,sans-serif;white-space:nowrap;">${label}</td>
    <td style="padding:11px 18px;border-bottom:1px solid ${SAND};font-size:14px;color:${ESPRESSO};text-align:right;${strong ? "font-weight:bold;" : ""}font-family:Georgia,serif;">${value}</td>
  </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Notification interne + accusé de réception client pour un rendez-vous. */
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const resend = getResend();
  const to = process.env.BOOKING_EMAIL_TO;
  const from =
    process.env.BOOKING_EMAIL_FROM ?? "Maison Kanali <onboarding@resend.dev>";

  if (!resend || !to) {
    console.warn(
      "[email] RESEND_API_KEY ou BOOKING_EMAIL_TO manquant — emails de réservation non envoyés.",
    );
    return;
  }

  const dateLabel = `${formatDateFr(data.date)} · ${formatTimeFr(data.time)}`;
  const clientName = `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`;

  const detailRows =
    row("Référence", data.reference, true) +
    row("Prestation", escapeHtml(data.serviceName), true) +
    row("Pôle", escapeHtml(data.brandLabel)) +
    row("Date", escapeHtml(dateLabel), true) +
    row("Durée", formatDuration(data.durationMin)) +
    row("Tarif", escapeHtml(data.price));

  const clientRows =
    row("Cliente", clientName, true) +
    row("Email", escapeHtml(data.email)) +
    row("Téléphone", escapeHtml(data.phone)) +
    (data.notes ? row("Précisions", escapeHtml(data.notes)) : "");

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Nouveau rendez-vous — ${data.serviceName} · ${formatDateFr(data.date)} ${formatTimeFr(data.time)}`,
      html: shell(
        "Nouvelle demande de rendez-vous",
        `${clientName} vient de réserver en ligne. Pensez à confirmer ce rendez-vous auprès de la cliente.`,
        detailRows + clientRows,
        `Répondre à cet email écrira directement à ${escapeHtml(data.email)}.`,
      ),
    }),
    resend.emails.send({
      from,
      to: data.email,
      subject: `Votre demande de rendez-vous — Maison Kanali (${data.reference})`,
      html: shell(
        `Merci, ${escapeHtml(data.firstName)}.`,
        "Votre demande de rendez-vous a bien été reçue. Maison Kanali vous la confirmera très prochainement.",
        detailRows,
        "Un empêchement ? Répondez simplement à cet email pour modifier ou annuler votre rendez-vous.",
      ),
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[email] Échec d'envoi:", result.reason);
    }
  }
}

/** Notification interne + accusé client pour une demande de formation. */
export async function sendFormationEmails(data: FormationEmailData): Promise<void> {
  const resend = getResend();
  const to = process.env.BOOKING_EMAIL_TO;
  const from =
    process.env.BOOKING_EMAIL_FROM ?? "Maison Kanali <onboarding@resend.dev>";

  if (!resend || !to) {
    console.warn(
      "[email] RESEND_API_KEY ou BOOKING_EMAIL_TO manquant — emails de formation non envoyés.",
    );
    return;
  }

  const clientName = `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`;

  const rows =
    row("Référence", data.reference, true) +
    row("Formation", escapeHtml(data.formationName), true) +
    (data.kitOption ? row("Option", escapeHtml(data.kitOption)) : "") +
    row("Élève", clientName, true) +
    row("Email", escapeHtml(data.email)) +
    row("Téléphone", escapeHtml(data.phone)) +
    (data.message ? row("Message", escapeHtml(data.message)) : "");

  const results = await Promise.allSettled([
    resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject: `Nouvelle demande de formation — ${data.formationName}`,
      html: shell(
        "Nouvelle demande d'inscription",
        `${clientName} souhaite s'inscrire à une formation. Contactez-la pour convenir des dates.`,
        rows,
        `Répondre à cet email écrira directement à ${escapeHtml(data.email)}.`,
      ),
    }),
    resend.emails.send({
      from,
      to: data.email,
      subject: `Votre demande de formation — Maison Kanali (${data.reference})`,
      html: shell(
        `Merci, ${escapeHtml(data.firstName)}.`,
        "Votre demande d'inscription a bien été reçue. Maison Kanali vous recontactera très vite pour convenir des dates et des modalités.",
        row("Référence", data.reference, true) +
          row("Formation", escapeHtml(data.formationName), true) +
          (data.kitOption ? row("Option", escapeHtml(data.kitOption)) : ""),
        "Une question ? Répondez simplement à cet email.",
      ),
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[email] Échec d'envoi:", result.reason);
    }
  }
}
