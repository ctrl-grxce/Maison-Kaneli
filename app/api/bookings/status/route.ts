import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";
import { clientIp, isSameOrigin, rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/bookings/status?id=… — statut d'une réservation, rien d'autre.
 * Sert à la page de confirmation après paiement : « confirmée » ou « en cours
 * de validation ». Aucune donnée personnelle ne sort d'ici.
 */
export async function GET(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  if (!rateLimit("booking-status", clientIp(request), 30, 10 * 60_000)) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("get_booking_status", { p_id: id });
  if (error) {
    console.error("[booking-status] RPC get_booking_status:", error);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Réservation introuvable." }, { status: 404 });
  }

  return NextResponse.json({ status: data });
}
