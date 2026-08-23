import nodemailer from "nodemailer";
import { Resend } from "resend";
import { buildBookingIcs } from "./ics";
import { buildTicketPdf } from "./ticket-pdf";
import { formatDateFr, formatTimeFr, formatDuration } from "./utils";
import { CONTACT } from "./config";

/**
 * Emails transactionnels de Maison Kanali.
 *
 * Deux transports possibles, choisis automatiquement :
 *   1. Gmail (GMAIL_USER + GMAIL_APP_PASSWORD) — recommandé : envoie depuis
 *      la vraie adresse maisonkanali@gmail.com, vers n'importe quelle cliente,
 *      sans domaine à acheter.
 *   2. Resend (RESEND_API_KEY) — utile plus tard avec un domaine vérifié.
 *
 * Sans configuration, les fonctions se désactivent proprement : la
 * réservation reste enregistrée, seul l'envoi d'email est ignoré.
 */

interface BookingEmailData {
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

/* ── Transport ───────────────────────────────────────────────────────────── */

interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

function emailConfigured(): boolean {
  return Boolean(
    (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) ||
      process.env.RESEND_API_KEY,
  );
}

async function sendEmail(message: EmailMessage): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPassword) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: gmailUser, pass: gmailPassword },
    });
    await transporter.sendMail({
      from: `"Maison Kanali" <${gmailUser}>`,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      attachments: message.attachments?.map((item) => ({
        filename: item.filename,
        content: item.content,
        contentType: item.contentType,
      })),
    });
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const resend = new Resend(resendKey);
    const from =
      process.env.BOOKING_EMAIL_FROM ?? "Maison Kanali <onboarding@resend.dev>";
    const { error } = await resend.emails.send({
      from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      attachments: message.attachments?.map((item) => ({
        filename: item.filename,
        content:
          typeof item.content === "string"
            ? Buffer.from(item.content).toString("base64")
            : item.content.toString("base64"),
        contentType: item.contentType,
      })),
    });
    if (error) throw new Error(`Resend: ${error.message}`);
    return;
  }

  console.warn(
    "[email] Aucun transport configuré (GMAIL_USER/GMAIL_APP_PASSWORD ou RESEND_API_KEY) — email non envoyé :",
    message.subject,
  );
}

/* ── Gabarit ─────────────────────────────────────────────────────────────── */

function shell(
  title: string,
  intro: string,
  body: string,
  footer: string,
): string {
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
            <td style="padding:20px 40px 8px;">${body}</td>
          </tr>
          <tr>
            <td style="padding:20px 40px 36px;">
              <div style="font-size:13px;line-height:1.7;color:${TAUPE};font-family:Arial,sans-serif;">${footer}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 40px;border-top:1px solid ${SAND};text-align:center;">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TAUPE};font-family:Arial,sans-serif;">
                Maison Kanali · ${CONTACT.scheduleLabel}
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function detailTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${SAND};background-color:${IVORY};">${rows}</table>`;
}

function row(label: string, value: string, strong = false): string {
  return `<tr>
    <td style="padding:11px 18px;border-bottom:1px solid ${SAND};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${TAUPE};font-family:Arial,sans-serif;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:11px 18px;border-bottom:1px solid ${SAND};font-size:14px;color:${ESPRESSO};text-align:right;${strong ? "font-weight:bold;" : ""}font-family:Georgia,serif;">${value}</td>
  </tr>`;
}

/** Ligne d'en-tête de section, sur toute la largeur du tableau. */
function sectionRow(label: string): string {
  return `<tr>
    <td colspan="2" style="padding:13px 18px 9px;border-bottom:1px solid ${SAND};background-color:#ffffff;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${BRONZE};font-family:Arial,sans-serif;">${label}</td>
  </tr>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

/** Ticket de rendez-vous — le bloc central de l'email de confirmation. */
function ticket(data: BookingEmailData): string {
  const rows =
    row("Prestation", escapeHtml(data.serviceName), true) +
    row("Pôle", escapeHtml(data.brandLabel)) +
    row("Date", escapeHtml(formatDateFr(data.date)), true) +
    row(
      "Heure",
      `${escapeHtml(formatTimeFr(data.time))} – ${escapeHtml(formatTimeFr(data.endTime))}`,
      true,
    ) +
    row("Durée", formatDuration(data.durationMin)) +
    row("Tarif", escapeHtml(data.price));

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRONZE};background-color:#ffffff;">
    <tr>
      <td style="padding:18px 18px 16px;background-color:${BRONZE};text-align:center;">
        <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${IVORY};font-family:Arial,sans-serif;">Ticket de rendez-vous</div>
        <div style="font-size:24px;letter-spacing:3px;color:#ffffff;padding-top:8px;font-family:Georgia,serif;">${escapeHtml(data.reference)}</div>
      </td>
    </tr>
    <tr><td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
    <tr>
      <td style="padding:14px 18px;border-top:1px dashed ${BRONZE};text-align:center;">
        <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:${TAUPE};font-family:Arial,sans-serif;line-height:1.8;">
          ${CONTACT.scheduleLabel}<br />Saint-Quentin · Sur rendez-vous
        </div>
      </td>
    </tr>
  </table>`;
}

/* ── Rendez-vous ─────────────────────────────────────────────────────────── */

/** Contenus des deux emails de réservation (purs — testables sans envoi). */
export function buildBookingEmails(data: BookingEmailData): {
  manager: { subject: string; html: string };
  client: { subject: string; html: string; ics: string };
} {
  const clientName = `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`;
  const dateLabel = formatDateFr(data.date);
  const timeRange = `${formatTimeFr(data.time)} – ${formatTimeFr(data.endTime)}`;

  /* — Notification pour la maison : tout le détail, en deux sections — */
  const managerRows =
    sectionRow("Le rendez-vous") +
    row("Référence", escapeHtml(data.reference), true) +
    row("Prestation", escapeHtml(data.serviceName), true) +
    row("Pôle", escapeHtml(data.brandLabel)) +
    row("Date", escapeHtml(dateLabel), true) +
    row("Heure", escapeHtml(timeRange), true) +
    row("Durée", formatDuration(data.durationMin)) +
    row("Tarif", escapeHtml(data.price)) +
    sectionRow("La cliente") +
    row("Nom", clientName, true) +
    row(
      "Téléphone",
      `<a href="${telHref(data.phone)}" style="color:${ESPRESSO};">${escapeHtml(data.phone)}</a>`,
    ) +
    row(
      "Email",
      `<a href="mailto:${escapeHtml(data.email)}" style="color:${ESPRESSO};">${escapeHtml(data.email)}</a>`,
    ) +
    (data.notes ? row("Précisions", escapeHtml(data.notes)) : "");

  /* — Invitation calendrier jointe à la confirmation cliente — */
  const ics = buildBookingIcs({
    reference: data.reference,
    serviceName: data.serviceName,
    date: data.date,
    startTime: data.time,
    endTime: data.endTime,
  });

  return {
    manager: {
      subject: `Nouveau rendez-vous — ${dateLabel} à ${formatTimeFr(data.time)} · ${data.serviceName}`,
      html: shell(
        "Nouvelle demande de rendez-vous",
        `${clientName} vient de réserver en ligne. Ce créneau n'est plus proposé sur le site : aucune autre cliente ne peut le réserver. Il vous reste à confirmer le rendez-vous auprès de la cliente.`,
        detailTable(managerRows),
        `L'invitation jointe ajoute ce rendez-vous à votre agenda (Google, Apple ou Outlook) en un clic, avec un rappel la veille.<br /><br />Répondre à cet email écrira directement à ${escapeHtml(data.email)}.`,
      ),
    },
    client: {
      subject: `Votre rendez-vous du ${dateLabel} — Maison Kanali (${data.reference})`,
      html: shell(
        `Merci, ${escapeHtml(data.firstName)}.`,
        `Votre demande de rendez-vous est bien enregistrée et votre créneau est réservé. Maison Kanali vous en confirmera la tenue très prochainement — voici votre ticket, à présenter à votre arrivée.`,
        ticket(data),
        `Deux pièces sont jointes à cet email : votre <strong>ticket de réservation</strong> (PDF, à présenter à votre arrivée) et une <strong>invitation calendrier</strong> pour ajouter le rendez-vous à votre agenda (Google, Apple ou Outlook), avec un rappel automatique la veille.<br /><br />Un empêchement ? Répondez simplement à cet email pour modifier ou annuler votre rendez-vous.`,
      ),
      ics,
    },
  };
}

/** Notification interne détaillée + confirmation cliente avec ticket. */
export async function sendBookingEmails(data: BookingEmailData): Promise<void> {
  const to = process.env.BOOKING_EMAIL_TO;

  if (!emailConfigured() || !to) {
    console.warn(
      "[email] Transport ou BOOKING_EMAIL_TO manquant — emails de réservation non envoyés.",
    );
    return;
  }

  const emails = buildBookingEmails(data);

  /* Ticket PDF joint à la confirmation cliente (reçu en attendant le
     paiement en ligne). S'il échoue, l'email part quand même sans lui. */
  let ticketPdf: Buffer | null = null;
  try {
    ticketPdf = Buffer.from(await buildTicketPdf(data));
  } catch (pdfError) {
    console.error("[email] Génération du ticket PDF échouée:", pdfError);
  }

  const icsAttachment = {
    filename: `rendez-vous-${data.reference}.ics`,
    content: emails.client.ics,
    contentType: "text/calendar; charset=utf-8; method=PUBLISH",
  };

  const results = await Promise.allSettled([
    sendEmail({
      to,
      replyTo: data.email,
      subject: emails.manager.subject,
      html: emails.manager.html,
      /* La maison aussi ajoute le rendez-vous à son agenda en un clic. */
      attachments: [icsAttachment],
    }),
    sendEmail({
      to: data.email,
      /* Les réponses de la cliente arrivent dans la boîte de la maison. */
      replyTo: to,
      subject: emails.client.subject,
      html: emails.client.html,
      attachments: [
        ...(ticketPdf
          ? [
              {
                filename: `ticket-${data.reference}.pdf`,
                content: ticketPdf,
                contentType: "application/pdf",
              },
            ]
          : []),
        icsAttachment,
      ],
    }),
  ]);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[email] Échec d'envoi:", result.reason);
    }
  }
}

/* ── Formations ──────────────────────────────────────────────────────────── */

/** Notification interne + accusé client pour une demande de formation. */
export async function sendFormationEmails(data: FormationEmailData): Promise<void> {
  const to = process.env.BOOKING_EMAIL_TO;

  if (!emailConfigured() || !to) {
    console.warn(
      "[email] Transport ou BOOKING_EMAIL_TO manquant — emails de formation non envoyés.",
    );
    return;
  }

  const clientName = `${escapeHtml(data.firstName)} ${escapeHtml(data.lastName)}`;

  const managerRows =
    sectionRow("La demande") +
    row("Référence", escapeHtml(data.reference), true) +
    row("Formation", escapeHtml(data.formationName), true) +
    (data.kitOption ? row("Option", escapeHtml(data.kitOption)) : "") +
    sectionRow("L'élève") +
    row("Nom", clientName, true) +
    row(
      "Téléphone",
      `<a href="${telHref(data.phone)}" style="color:${ESPRESSO};">${escapeHtml(data.phone)}</a>`,
    ) +
    row(
      "Email",
      `<a href="mailto:${escapeHtml(data.email)}" style="color:${ESPRESSO};">${escapeHtml(data.email)}</a>`,
    ) +
    (data.message ? row("Message", escapeHtml(data.message)) : "");

  const clientRows =
    row("Référence", escapeHtml(data.reference), true) +
    row("Formation", escapeHtml(data.formationName), true) +
    (data.kitOption ? row("Option", escapeHtml(data.kitOption)) : "");

  const results = await Promise.allSettled([
    sendEmail({
      to,
      replyTo: data.email,
      subject: `Nouvelle demande de formation — ${data.formationName}`,
      html: shell(
        "Nouvelle demande d'inscription",
        `${clientName} souhaite s'inscrire à une formation. Contactez-la pour convenir des dates.`,
        detailTable(managerRows),
        `Répondre à cet email écrira directement à ${escapeHtml(data.email)}.`,
      ),
    }),
    sendEmail({
      to: data.email,
      replyTo: to,
      subject: `Votre demande de formation — Maison Kanali (${data.reference})`,
      html: shell(
        `Merci, ${escapeHtml(data.firstName)}.`,
        "Votre demande d'inscription a bien été reçue. Maison Kanali vous recontactera très vite pour convenir des dates et des modalités.",
        detailTable(clientRows),
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
