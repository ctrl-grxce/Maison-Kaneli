import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { classifyThreat, decoyPayload } from "@/lib/honeypots";

/*
 * Proxy Edge (ex-middleware) — première ligne de défense, exécutée AVANT
 * toute route.
 *
 * Rôle : intercepter les chemins-leurres et les sondes d'attaque, répondre
 * par un décor factice crédible (l'intrus croit avancer, il tourne en rond),
 * et signaler la tentative (journal + alerte). Aucune vraie donnée n'est
 * jamais touchée ici.
 */

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnue"
  );
}

/** Signale la tentative à la route de report (best-effort, ne bloque jamais). */
function report(
  request: NextRequest,
  event: NextFetchEvent,
  detail: { path: string; reason: string; ip: string },
): void {
  const secret = process.env.SECURITY_REPORT_SECRET;
  const payload = {
    path: detail.path,
    reason: detail.reason,
    ip: detail.ip,
    ua: request.headers.get("user-agent") ?? "",
    method: request.method,
    ts: new Date().toISOString(),
  };

  // Toujours visible dans les logs Vercel, même sans email configuré.
  console.warn(`[securite] leurre touché — ${JSON.stringify(payload)}`);

  event.waitUntil(
    fetch(`${request.nextUrl.origin}/api/security/report`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(secret ? { "x-mk-guard": secret } : {}),
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      /* Le report ne doit jamais casser la réponse. */
    }),
  );
}

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = request.nextUrl;
  const verdict = classifyThreat(pathname, pathname + search);

  if (verdict.hit) {
    report(request, event, {
      path: pathname,
      reason: verdict.reason,
      ip: clientIp(request),
    });

    const decoy = decoyPayload(verdict.kind);
    return new NextResponse(decoy.body, {
      status: decoy.status,
      headers: {
        "content-type": decoy.contentType,
        // On ne laisse aucun indice, et on interdit toute mise en cache.
        "cache-control": "no-store",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  return NextResponse.next();
}

/*
 * On exécute le middleware partout SAUF sur les ressources statiques
 * (bundles, images, vidéos, favicon) — pour rester rapide et ne jamais
 * gêner l'affichage du site.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|videos/).*)",
  ],
};
