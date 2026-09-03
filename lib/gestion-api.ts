import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAuthorized } from "./gestion-auth";
import { getSupabaseAdmin } from "./supabase-server";
import { clientIp, isSameOrigin, rateLimit, RATE_LIMIT_MESSAGE } from "./rate-limit";

/**
 * Garde-fous communs des routes /api/gestion/* : origine, débit, cookie.
 * Renvoie une réponse d'erreur à retourner telle quelle, ou null si tout va bien.
 */
export function guardGestion(request: Request): NextResponse | null {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  if (!rateLimit("gestion", clientIp(request), 120, 60_000)) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  }
  return null;
}

/** Client administrateur, ou la réponse 503 à renvoyer s'il est absent. */
export function adminClientOr503():
  | { supabase: SupabaseClient; response: null }
  | { supabase: null; response: NextResponse } {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      supabase: null,
      response: NextResponse.json(
        {
          error:
            "L'espace de gestion est momentanément indisponible (configuration serveur incomplète).",
        },
        { status: 503 },
      ),
    };
  }
  return { supabase, response: null };
}

/** Référence publique d'une réservation — même règle que le site. */
export function bookingReference(id: string): string {
  return `MK-${id.slice(0, 6).toUpperCase()}`;
}
