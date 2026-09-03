import { NextResponse } from "next/server";
import { z } from "zod";
import { guardGestion, adminClientOr503, bookingReference } from "@/lib/gestion-api";
import { sendCancellationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const schema = z.object({ id: z.string().uuid() });

/**
 * POST /api/gestion/bookings/cancel — annule une réservation (décision de la
 * maison). Le créneau est libéré immédiatement et la cliente est prévenue
 * par email.
 */
export async function POST(request: Request) {
  const denied = guardGestion(request);
  if (denied) return denied;

  const { supabase, response } = adminClientOr503();
  if (!supabase) return response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  /* Seules les réservations vivantes s'annulent ici : une attente de
     paiement expire toute seule, une annulée reste annulée. */
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", parsed.data.id)
    .in("status", ["pending", "confirmed"])
    .select(
      "id, service_name, booking_date, start_time, first_name, email, deposit_cents, paid_at",
    );

  if (error) {
    console.error("[gestion] Annulation:", error);
    return NextResponse.json(
      { error: "L'annulation a échoué. Merci de réessayer." },
      { status: 500 },
    );
  }
  const row = data?.[0];
  if (!row) {
    return NextResponse.json(
      { error: "Cette réservation ne peut pas être annulée (déjà annulée ou en attente de paiement)." },
      { status: 409 },
    );
  }

  try {
    await sendCancellationEmail({
      reference: bookingReference(String(row.id)),
      serviceName: String(row.service_name),
      date: String(row.booking_date),
      time: String(row.start_time).slice(0, 5),
      firstName: String(row.first_name),
      email: String(row.email),
      depositPaid: Boolean(row.paid_at) && Number(row.deposit_cents) > 0,
    });
  } catch (emailError) {
    /* L'annulation est faite — l'échec d'email ne doit pas la casser. */
    console.error("[gestion] Email d'annulation échoué:", emailError);
    return NextResponse.json({ ok: true, emailSent: false });
  }

  return NextResponse.json({ ok: true, emailSent: true });
}
