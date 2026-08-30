import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";
import { clientIp, isSameOrigin, rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/bookings/cancel-hold — libère immédiatement un créneau dont le
 * paiement a été abandonné (retour depuis la page Stripe).
 *
 * Sans danger : la fonction en base n'agit QUE sur les réservations encore
 * « en attente de paiement » — une réservation confirmée ou payée ne peut
 * jamais être annulée par ce chemin.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  if (!rateLimit("cancel-hold", clientIp(request), 10, 10 * 60_000)) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const bookingId =
    typeof payload === "object" && payload !== null && "bookingId" in payload
      ? String((payload as Record<string, unknown>).bookingId)
      : "";
  if (!UUID_PATTERN.test(bookingId)) {
    return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  }

  const { data, error } = await supabase.rpc("cancel_payment_hold", {
    p_id: bookingId,
  });
  if (error) {
    console.error("[cancel-hold] RPC cancel_payment_hold:", error);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }

  return NextResponse.json({ released: Boolean(data) });
}
