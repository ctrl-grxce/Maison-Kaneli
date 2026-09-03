import { NextResponse } from "next/server";
import {
  adminCode,
  createSessionValue,
  GESTION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  verifyCode,
} from "@/lib/gestion-auth";
import {
  clientIp,
  isSameOrigin,
  rateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** POST /api/gestion/login — échange le code secret contre un cookie signé. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  /* Cinq essais par quart d'heure et par adresse : de quoi se tromper de
     frappe, pas de quoi deviner un code. */
  if (!rateLimit("gestion-login", clientIp(request), 5, 15 * 60_000)) {
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
    return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
  }

  const session = createSessionValue();
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: GESTION_COOKIE,
    value: session ?? "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
