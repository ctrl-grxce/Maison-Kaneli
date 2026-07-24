import { NextResponse } from "next/server";
import { recordThreat, lockLevel } from "@/lib/lockdown";
import { sendSecurityAlert, type ThreatEvent } from "@/lib/security-alert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/security/report — réception interne des tentatives détectées
 * par le middleware. Fait monter le compteur de menaces (escalade
 * automatique du cadenas) et déclenche l'alerte email si configurée.
 *
 * Route protégée par un secret partagé : sans le bon en-tête `x-mk-guard`,
 * on ne fait rien (un tiers ne peut donc pas fausser le compteur).
 */
export async function POST(request: Request) {
  const secret = process.env.SECURITY_REPORT_SECRET;
  if (secret && request.headers.get("x-mk-guard") !== secret) {
    return new NextResponse(null, { status: 204 });
  }

  let event: ThreatEvent;
  try {
    const body = (await request.json()) as Partial<ThreatEvent>;
    event = {
      path: String(body.path ?? "").slice(0, 300),
      reason: String(body.reason ?? "").slice(0, 200),
      ip: String(body.ip ?? "inconnue").slice(0, 60),
      ua: String(body.ua ?? "").slice(0, 300),
      method: String(body.method ?? "").slice(0, 10),
      ts: String(body.ts ?? new Date().toISOString()).slice(0, 40),
    };
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  const level = recordThreat();
  await sendSecurityAlert(event, level);

  return NextResponse.json({ ok: true, level: lockLevel() });
}
