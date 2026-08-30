import { NextResponse } from "next/server";
import { OPENING } from "@/lib/config";
import {
  getService,
  bookingPriceLabel,
  depositCentsFor,
  BRAND_LABELS,
} from "@/lib/services";
import { getSupabase } from "@/lib/supabase-server";
import { bookingSchema } from "@/lib/validation";
import { sendBookingEmails } from "@/lib/email";
import {
  paymentsEnabled,
  createDepositCheckoutSession,
  requestOrigin,
  HOLD_EXPIRES_MINUTES,
} from "@/lib/stripe";
import {
  clientIp,
  isSameOrigin,
  rateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";
import { writesBlocked, throttleFactor, LOCKDOWN_MESSAGE } from "@/lib/lockdown";
import {
  isBookableDate,
  minutesToTime,
  parisNow,
  timeToMinutes,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

/** POST /api/bookings — enregistre un rendez-vous puis notifie par email. */
export async function POST(request: Request) {
  // Étage 2+ (verrou écritures) : aucune nouvelle réservation n'entre en base.
  if (writesBlocked()) {
    return NextResponse.json({ error: LOCKDOWN_MESSAGE }, { status: 503 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  if (
    !rateLimit("bookings", clientIp(request), Math.max(1, Math.ceil(5 / throttleFactor())), 10 * 60_000)
  ) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

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

  const priceLabel = bookingPriceLabel(service);

  /* ── Aiguillage acompte (docs/PAIEMENT.md) ───────────────────────────────
     Acompte > 0 et paiements allumés → la réservation est créée en
     « awaiting_payment » (elle bloque le créneau, expire toute seule) et la
     cliente part payer chez Stripe. AUCUN email ne part à ce stade.
     Sinon → circuit historique, strictement identique à avant. */
  const depositCents = depositCentsFor(service);
  const withPayment = depositCents > 0 && paymentsEnabled();

  const { data: bookingId, error } = await supabase.rpc("create_booking", {
    p_service_id: service.id,
    p_service_name: service.name,
    p_brand: service.brand,
    p_price_label: priceLabel,
    p_duration_min: service.durationMin,
    p_date: input.date,
    p_start_time: input.time,
    p_end_time: minutesToTime(endMin),
    p_first_name: input.firstName,
    p_last_name: input.lastName,
    p_email: input.email,
    p_phone: input.phone,
    p_notes: input.notes ?? "",
    ...(withPayment
      ? {
          p_status: "awaiting_payment",
          p_deposit_cents: depositCents,
          p_expires_at: new Date(
            Date.now() + HOLD_EXPIRES_MINUTES * 60_000,
          ).toISOString(),
        }
      : {}),
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

  /* ── Parcours avec acompte : direction la page de paiement Stripe ──────── */
  if (withPayment) {
    try {
      const session = await createDepositCheckoutSession({
        bookingId: String(bookingId),
        reference,
        serviceName: service.name,
        brandLabel: BRAND_LABELS[service.brand],
        depositCents,
        customerEmail: input.email,
        origin: requestOrigin(request),
        date: input.date,
        time: input.time,
      });
      await supabase.rpc("attach_stripe_session", {
        p_id: bookingId,
        p_session_id: session.id,
      });
      return NextResponse.json(
        { reference, checkoutUrl: session.url },
        { status: 201 },
      );
    } catch (stripeError) {
      /* Stripe injoignable : on libère le créneau et on explique. */
      console.error("[bookings] Création de session Stripe échouée:", stripeError);
      await supabase.rpc("cancel_payment_hold", { p_id: bookingId });
      return NextResponse.json(
        {
          error:
            "Le paiement en ligne est momentanément indisponible. Merci de réessayer dans quelques minutes.",
        },
        { status: 503 },
      );
    }
  }

  try {
    await sendBookingEmails({
      reference,
      serviceName: service.name,
      brandLabel: BRAND_LABELS[service.brand],
      price: priceLabel,
      durationMin: service.durationMin,
      date: input.date,
      time: input.time,
      endTime: minutesToTime(endMin),
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
