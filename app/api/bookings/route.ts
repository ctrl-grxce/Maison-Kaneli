import { NextResponse } from "next/server";
import { OPENING } from "@/lib/config";
import { getService, BRAND_LABELS } from "@/lib/services";
import { getSupabase } from "@/lib/supabase-server";
import { bookingSchema } from "@/lib/validation";
import { sendBookingEmails } from "@/lib/email";
import {
  isBookableDate,
  minutesToTime,
  parisNow,
  timeToMinutes,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

/** POST /api/bookings — enregistre un rendez-vous puis notifie par email. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  /* Champ « piège » anti-robots : un humain ne le remplit jamais. */
  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    (payload as Record<string, unknown>).website
  ) {
    return NextResponse.json({ reference: "MK-OK" }, { status: 201 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Certains champs sont invalides.",
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const service = getService(input.serviceId);
  if (!service) {
    return NextResponse.json(
      { error: "Prestation inconnue." },
      { status: 400 },
    );
  }

  /* ── Contrôles du créneau ────────────────────────────────────────────── */
  if (!isBookableDate(input.date)) {
    return NextResponse.json(
      { error: "Cette date n'est pas réservable." },
      { status: 400 },
    );
  }

  const startMin = timeToMinutes(input.time);
  const endMin = startMin + service.durationMin;
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

  const now = parisNow();
  if (
    input.date === now.date &&
    startMin < now.minutes + OPENING.minLeadMinutes
  ) {
    return NextResponse.json(
      {
        error:
          "Ce créneau est trop proche. Merci de choisir un horaire plus tard dans la journée.",
      },
      { status: 400 },
    );
  }

  /* ── Enregistrement atomique ─────────────────────────────────────────── */
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "La réservation en ligne est momentanément indisponible." },
      { status: 503 },
    );
  }

  const { data: bookingId, error } = await supabase.rpc("create_booking", {
    p_service_id: service.id,
    p_service_name: service.name,
    p_brand: service.brand,
    p_price_label: service.price,
    p_duration_min: service.durationMin,
    p_date: input.date,
    p_start_time: input.time,
    p_end_time: minutesToTime(endMin),
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_email: input.email,
    p_phone: input.phone,
    p_notes: input.notes ?? "",
  });

  if (error) {
    if (error.message?.includes("SLOT_TAKEN")) {
      return NextResponse.json(
        {
          error:
            "Ce créneau vient d'être réservé par une autre cliente. Merci d'en choisir un autre.",
          code: "SLOT_TAKEN",
        },
        { status: 409 },
      );
    }
    console.error("[bookings] RPC create_booking:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Merci de réessayer." },
      { status: 500 },
    );
  }

  const reference = `MK-${String(bookingId).slice(0, 6).toUpperCase()}`;

  try {
    await sendBookingEmails({
      reference,
      serviceName: service.name,
      brandLabel: BRAND_LABELS[service.brand],
      price: service.price,
      durationMin: service.durationMin,
      date: input.date,
      time: input.time,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      notes: input.notes,
    });
  } catch (emailError) {
    /* La réservation est enregistrée — l'échec d'email ne doit pas la casser. */
    console.error("[bookings] Envoi d'emails échoué:", emailError);
  }

  return NextResponse.json({ reference }, { status: 201 });
}
