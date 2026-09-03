import { NextResponse } from "next/server";
import { z } from "zod";
import { OPENING } from "@/lib/config";
import { guardGestion, adminClientOr503, bookingReference } from "@/lib/gestion-api";
import { sendRescheduleEmail } from "@/lib/email";
import { BRAND_LABELS, formatEuros, remainderLabelFor, type Brand } from "@/lib/services";
import {
  isBookableDate,
  minutesToTime,
  timeToMinutes,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

/**
 * POST /api/gestion/bookings/reschedule — déplace une réservation vers un
 * autre créneau libre. Mêmes règles d'ouverture que le site public (jour
 * ouvré, horaires, alignement), sans le délai minimal du jour même : la
 * maison reste maîtresse de son agenda. La cliente reçoit son nouveau ticket.
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
  const { id, date, time } = parsed.data;

  if (!isBookableDate(date)) {
    return NextResponse.json(
      { error: "Cette date n'est pas ouvrable (ou trop lointaine)." },
      { status: 400 },
    );
  }

  /* ── La réservation à déplacer ───────────────────────────────────────── */
  const { data: rows, error: readError } = await supabase
    .from("bookings")
    .select(
      "id, service_name, brand, price_label, duration_min, booking_date, start_time, end_time, first_name, last_name, email, phone, notes, status, deposit_cents, invoice_number, paid_at",
    )
    .eq("id", id)
    .limit(1);
  if (readError) {
    console.error("[gestion] Lecture avant déplacement:", readError);
    return NextResponse.json(
      { error: "Impossible de lire la réservation." },
      { status: 500 },
    );
  }
  const booking = rows?.[0];
  if (!booking || !["pending", "confirmed"].includes(String(booking.status))) {
    return NextResponse.json(
      { error: "Cette réservation ne peut pas être déplacée." },
      { status: 409 },
    );
  }

  /* ── Contrôles du nouveau créneau ────────────────────────────────────── */
  const durationMin = Number(booking.duration_min);
  const startMin = timeToMinutes(time);
  const endMin = startMin + durationMin;
  const misaligned =
    (startMin - OPENING.openMinutes) % OPENING.slotStepMinutes !== 0;
  if (
    startMin < OPENING.openMinutes ||
    endMin > OPENING.closeMinutes ||
    misaligned
  ) {
    return NextResponse.json(
      { error: "Ce créneau est en dehors des horaires d'ouverture." },
      { status: 400 },
    );
  }
  const endTime = minutesToTime(endMin);

  /* Plage bloquée par la maison ? */
  const { data: blocked, error: blockedError } = await supabase
    .from("blocked_slots")
    .select("id, start_time, end_time")
    .eq("day", date);
  if (blockedError) {
    console.error("[gestion] Lecture des indisponibilités:", blockedError);
    return NextResponse.json(
      { error: "Impossible de vérifier les indisponibilités." },
      { status: 500 },
    );
  }
  const overlapsBlock = (blocked ?? []).some((slot) => {
    const blockStart = slot.start_time
      ? timeToMinutes(String(slot.start_time).slice(0, 5))
      : 0;
    const blockEnd = slot.end_time
      ? timeToMinutes(String(slot.end_time).slice(0, 5))
      : 24 * 60;
    return startMin < blockEnd && endMin > blockStart;
  });
  if (overlapsBlock) {
    return NextResponse.json(
      { error: "Ce créneau est marqué indisponible.", code: "SLOT_TAKEN" },
      { status: 409 },
    );
  }

  /* Libère les blocages de paiement expirés qui chevauchent la cible. */
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("booking_date", date)
    .eq("status", "awaiting_payment")
    .lt("expires_at", new Date().toISOString())
    .lt("start_time", endTime)
    .gt("end_time", time);

  /* ── Déplacement — la contrainte anti-chevauchement tranche ──────────── */
  const previousDate = String(booking.booking_date);
  const previousTime = String(booking.start_time).slice(0, 5);
  const { data: updated, error: updateError } = await supabase
    .from("bookings")
    .update({ booking_date: date, start_time: time, end_time: endTime })
    .eq("id", id)
    .in("status", ["pending", "confirmed"])
    .select("id");
  if (updateError) {
    if (updateError.code === "23P01") {
      return NextResponse.json(
        {
          error: "Ce créneau est déjà pris par une autre réservation.",
          code: "SLOT_TAKEN",
        },
        { status: 409 },
      );
    }
    console.error("[gestion] Déplacement:", updateError);
    return NextResponse.json(
      { error: "Le déplacement a échoué. Merci de réessayer." },
      { status: 500 },
    );
  }
  if (!updated?.[0]) {
    return NextResponse.json(
      { error: "Cette réservation ne peut pas être déplacée." },
      { status: 409 },
    );
  }

  /* ── Nouveau ticket pour la cliente ──────────────────────────────────── */
  const depositCents = Number(booking.deposit_cents ?? 0);
  const depositPaid = Boolean(booking.paid_at) && depositCents > 0;
  let emailSent = true;
  try {
    await sendRescheduleEmail({
      reference: bookingReference(String(booking.id)),
      serviceName: String(booking.service_name),
      brandLabel: BRAND_LABELS[booking.brand as Brand] ?? String(booking.brand),
      price: String(booking.price_label),
      durationMin,
      date,
      time,
      endTime,
      firstName: String(booking.first_name),
      lastName: String(booking.last_name),
      email: String(booking.email),
      phone: String(booking.phone),
      notes: booking.notes ? String(booking.notes) : undefined,
      previousDate,
      previousTime,
      ...(depositPaid
        ? {
            deposit: {
              paidLabel: formatEuros(depositCents),
              remainderLabel: remainderLabelFor(
                String(booking.price_label),
                depositCents,
              ),
              invoiceNumber: String(booking.invoice_number ?? ""),
              issuedOn: date,
            },
          }
        : {}),
    });
  } catch (emailError) {
    console.error("[gestion] Email de déplacement échoué:", emailError);
    emailSent = false;
  }

  return NextResponse.json({ ok: true, emailSent });
}
