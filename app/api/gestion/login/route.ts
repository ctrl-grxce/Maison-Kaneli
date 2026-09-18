import { NextResponse } from "next/server";
import {
  adminCode,
  createSessionValue,
  GESTION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  SESSION_MAX_AGE_SECONDS,
  verifyCode,
} from "@/lib/gestion-auth";
import {
  clearFailures,
  clientIp,
  failureCount,
  isSameOrigin,
  rateLimit,
  recordFailure,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/* Trois verrous complémentaires, tous fondés sur les ÉCHECS seuls : une
   connexion réussie ne consomme rien, Kandy & Nafi ne peuvent donc pas se
   verrouiller elles-mêmes en se connectant souvent. */
const ECHECS = "gestion-login-echecs";
const ECHECS_PAR_IP = 5; // de quoi se tromper de frappe, pas de quoi deviner
const ECHECS_TOUTES_IP = 40; // changer d'adresse à chaque essai ne suffit plus
const FENETRE_MS = 15 * 60_000;
/** Clé du compteur « toutes adresses confondues ». */
const TOUTES = "toutes";

/** POST /api/gestion/login — échange le code secret contre un cookie signé. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  const ip = clientIp(request);

  /* Le premier verrou freine le simple martèlement du formulaire, les deux
     autres refusent les essais de codes — par adresse, puis globalement. */
  const bloque =
    !rateLimit("gestion-login", ip, 20, 60_000) ||
    failureCount(ECHECS, ip) >= ECHECS_PAR_IP ||
    failureCount(ECHECS, TOUTES) >= ECHECS_TOUTES_IP;
  if (bloque) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  if (!adminCode()) {
    return NextResponse.json(
      {
        error:
          "L'espace de gestion n'est pas encore activé (code d'accès non configuré).",
      },
      { status: 503 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const code =
    typeof payload === "object" && payload !== null && "code" in payload
      ? String((payload as Record<string, unknown>).code ?? "")
      : "";

  if (!verifyCode(code)) {
    const parIp = recordFailure(ECHECS, ip, FENETRE_MS);
    const total = recordFailure(ECHECS, TOUTES, FENETRE_MS);
    /* On ne journalise qu'au franchissement du seuil : une faute de frappe
       n'est pas un incident, une rafale en est un — et une ligne par essai
       noierait les logs au moment précis où ils doivent rester lisibles. */
    if (parIp === ECHECS_PAR_IP || total === ECHECS_TOUTES_IP) {
      console.warn(
        `[securite] essais de code répétés sur /gestion — ip=${ip}, échecs=${parIp}, toutes adresses=${total}`,
      );
    }
    return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
  }

  const session = createSessionValue();
  if (!session) {
    return NextResponse.json(
      { error: "L'espace de gestion est momentanément indisponible." },
      { status: 503 },
    );
  }
  clearFailures(ECHECS, ip);

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: GESTION_COOKIE,
    value: session,
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

/** DELETE /api/gestion/login — déconnexion. */
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: GESTION_COOKIE,
    value: "",
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
