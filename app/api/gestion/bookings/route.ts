import { NextResponse } from "next/server";
import { guardGestion, adminClientOr503, bookingReference } from "@/lib/gestion-api";
import { parisNow, addDays } from "@/lib/availability";

export const dynamic = "force-dynamic";

/** Colonnes renvoyées à l'écran de gestion (jamais au site public). */
const COLUMNS =
  "id, service_id, service_name, brand, price_label, duration_min, booking_date, start_time, end_time, first_name, last_name, email, phone, notes, status, deposit_cents, invoice_number, paid_at, expires_at, created_at";

/**
 * GET /api/gestion/bookings?scope=upcoming|past
 * Liste des réservations pour Kandy & Nafi (cookie signé obligatoire).
 */
export async function GET(request: Request) {
  const denied = guardGestion(request);
  if (denied) return denied;

  const { supabase, response } = adminClientOr503();
  if (!supabase) return response;

  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") === "past" ? "past" : "upcoming";
  const today = parisNow().date;

  let query = supabase.from("bookings").select(COLUMNS);
  if (scope === "upcoming") {
    query = query
      .gte("booking_date", today)
      .order("booking_date", { ascending: true })
      .order("start_time", { ascending: true });
  } else {
    /* « Passés & annulés » : l'historique récent + toute annulation, même
       future (pour vérifier qu'une annulation a bien été prise en compte). */
    query = query
      .or(`booking_date.lt.${today},status.eq.cancelled`)
      .gte("booking_date", addDays(today, -120))
      .order("booking_date", { ascending: false })
      .order("start_time", { ascending: false })
      .limit(200);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[gestion] Liste des réservations:", error);
    return NextResponse.json(
      { error: "Impossible de charger les réservations." },
      { status: 500 },
    );
  }

  const bookings = (data ?? [])
    .map((row) => ({
      ...row,
      reference: bookingReference(String(row.id)),
      /* Un blocage de paiement expiré n'est plus une réservation : affiché
         « paiement non abouti », aucune action possible. */
      expired:
        row.status === "awaiting_payment" &&
        Boolean(row.expires_at) &&
        new Date(String(row.expires_at)).getTime() < Date.now(),
    }))
    /* « À venir » ne montre que l'agenda réel : les annulées et les
       paiements non aboutis restent consultables dans « Passés ». */
    .filter(
      (row) =>
        scope === "past" || (row.status !== "cancelled" && !row.expired),
    );

  return NextResponse.json({ today, scope, bookings });
}
