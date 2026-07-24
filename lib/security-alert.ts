import { Resend } from "resend";

/**
 * Alerte de sécurité par email (via Resend, comme les réservations).
 *
 * Sans RESEND_API_KEY, la fonction se tait proprement : l'événement reste
 * de toute façon visible dans les logs Vercel. Les envois sont « anti-spam » :
 * au plus une alerte toutes les 10 minutes par adresse IP, pour qu'un intrus
 * ne puisse pas noyer ta boîte mail en martelant un leurre.
 */

export interface ThreatEvent {
  path: string;
  reason: string;
  ip: string;
  ua: string;
  method: string;
  ts: string;
}

const lastSentByIp = new Map<string, number>();
const DEBOUNCE_MS = 10 * 60_000;

const BRONZE = "#a9744f";
const ESPRESSO = "#2e241c";
const TAUPE = "#80705f";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Envoie l'alerte si (et seulement si) c'est utile et pas trop rapproché. */
export async function sendSecurityAlert(
  event: ThreatEvent,
  effectiveLevel: number,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.SECURITY_ALERT_TO ?? process.env.BOOKING_EMAIL_TO;
  const from =
    process.env.BOOKING_EMAIL_FROM ?? "Maison Kanali <onboarding@resend.dev>";
  if (!key || !to) return;

  const now = Date.now();
  const last = lastSentByIp.get(event.ip) ?? 0;
  if (now - last < DEBOUNCE_MS) return; // déjà alerté pour cette IP récemment
  lastSentByIp.set(event.ip, now);

  const resend = new Resend(key);
  const rows: [string, string][] = [
    ["Niveau de protection", `Étage ${effectiveLevel}`],
    ["Chemin visé", event.path],
    ["Nature", event.reason],
    ["Méthode", event.method],
    ["Adresse IP", event.ip],
    ["Navigateur", event.ua || "—"],
    ["Horodatage", event.ts],
  ];

  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#fdfbf7;font-family:Georgia,serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e7dccc;">
          <tr><td style="padding:28px 36px;border-bottom:1px solid #e7dccc;">
            <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${BRONZE};">Maison Kanali · Alerte sécurité</div>
            <div style="font-size:20px;color:${ESPRESSO};padding-top:8px;">Tentative d'intrusion détectée</div>
          </td></tr>
          <tr><td style="padding:20px 36px;">
            <p style="font-size:14px;line-height:1.7;color:${TAUPE};font-family:Arial,sans-serif;margin:0 0 16px;">
              Un leurre du site a été touché. Aucune donnée réelle n'a été exposée —
              l'intrus n'a reçu qu'un décor factice. Détails ci-dessous.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e7dccc;background:#fdfbf7;font-family:Arial,sans-serif;">
              ${rows
                .map(
                  ([label, value]) =>
                    `<tr><td style="padding:10px 16px;border-bottom:1px solid #e7dccc;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${TAUPE};white-space:nowrap;">${escapeHtml(
                      label,
                    )}</td><td style="padding:10px 16px;border-bottom:1px solid #e7dccc;font-size:13px;color:${ESPRESSO};text-align:right;">${escapeHtml(
                      value,
                    )}</td></tr>`,
                )
                .join("")}
            </table>
            <p style="font-size:12px;line-height:1.7;color:${TAUPE};font-family:Arial,sans-serif;margin:16px 0 0;">
              Si les alertes se multiplient, consulte le runbook (docs/SECURITE.md)
              pour déclencher le cadenas et faire tourner les clés.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;

  try {
    await resend.emails.send({
      from,
      to,
      subject: `⚠️ Sécurité Maison Kanali — leurre touché (${event.ip})`,
      html,
    });
  } catch {
    /* Une alerte qui échoue ne doit jamais casser la requête. */
  }
}
