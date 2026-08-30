import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getWebhookSecret } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase-server";
import { sendBookingEmails } from "@/lib/email";
import {
  BRAND_LABELS,
  formatEuros,
  remainderLabelFor,
  type Brand,
} from "@/lib/services";

export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook — c'est Stripe qui appelle cette route, de serveur
 * à serveur, pour certifier ce qui s'est passé sur la page de paiement
 * (docs/PAIEMENT.md).
 *
 * Sécurité : pas de contrôle d'origine ici (l'appelant est Stripe, pas un
 * navigateur) — l'authentification, c'est la SIGNATURE cryptographique
 * vérifiée ci-dessous. Sans signature valide : 400, rien ne se passe.
 *
 * Volontairement traité même en mode cadenas (SECURITY_LOCKDOWN) : l'argent
 * de la cliente est déjà encaissé, sa confirmation doit partir.
 *
 * Idempotent : si Stripe notifie deux fois le même paiement (ça arrive),
 * `confirm_paid_booking` ne renvoie une ligne qu'à la première — aucun
 * email en double.
 */

/** Ligne de réservation renvoyée par confirm_paid_booking. */
interface BookingRow {
  id: string;
  service_name: string;
  brand: string;
  price_label: string;
  duration_min: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string | null;
  deposit_cents: number;
  paid_at: string;
  invoice_number: string;
}

/** Date (AAAA-MM-JJ) en heure de Paris — pour dater la facture. */
function parisDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** « 14:00:00 » (Postgres) → « 14:00 ». */
function toHm(value: string): string {
  return String(value).slice(0, 5);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = getWebhookSecret();
  if (!stripe || !secret) {
    console.error("[stripe-webhook] STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET manquante.");
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature absente." }, { status: 400 });
  }

  /* Le corps BRUT est indispensable : la signature porte sur les octets exacts. */
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (signatureError) {
    console.error("[stripe-webhook] Signature invalide:", signatureError);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    /* 503 → Stripe réessaiera tout seul un peu plus tard. */
    return NextResponse.json({ error: "Base indisponible." }, { status: 503 });
  }

  switch (event.type) {
    /* ── Paiement réussi → confirmation + emails (une seule fois) ────────── */
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId =
        session.metadata?.booking_id ?? session.client_reference_id;
      if (!bookingId) {
        console.error("[stripe-webhook] Session sans booking_id:", session.id);
        break;
      }

      const { data, error } = await supabase.rpc("confirm_paid_booking", {
        p_id: bookingId,
        p_session_id: session.id,
      });
      if (error) {
        console.error("[stripe-webhook] confirm_paid_booking:", error);
        return NextResponse.json({ error: "Erreur base." }, { status: 503 });
      }

      const row = (Array.isArray(data) ? data[0] : data) as
        | BookingRow
        | undefined;
      if (!row) break; // déjà confirmée (double notification) — rien à refaire

      const reference = `MK-${String(row.id).slice(0, 6).toUpperCase()}`;
      const paidLabel = formatEuros(row.deposit_cents);

      try {
        await sendBookingEmails({
          reference,
          serviceName: row.service_name,
          brandLabel: BRAND_LABELS[row.brand as Brand] ?? row.brand,
          price: row.price_label,
          durationMin: row.duration_min,
          date: row.booking_date,
          time: toHm(row.start_time),
          endTime: toHm(row.end_time),
          firstName: row.first_name,
          lastName: row.last_name,
          email: row.email,
          phone: row.phone,
          notes: row.notes ?? undefined,
          deposit: {
            paidLabel,
            remainderLabel: remainderLabelFor(row.price_label, row.deposit_cents),
            invoiceNumber: row.invoice_number,
            issuedOn: parisDate(row.paid_at),
          },
        });
      } catch (emailError) {
        /* Le paiement et la confirmation sont enregistrés — un échec d'email
           ne doit pas faire réessayer Stripe (les emails repartiraient). */
        console.error("[stripe-webhook] Envoi d'emails échoué:", emailError);
      }
      break;
    }

    /* ── Session expirée ou paiement échoué → créneau libéré ─────────────── */
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId =
        session.metadata?.booking_id ?? session.client_reference_id;
      if (!bookingId) break;
      const { error } = await supabase.rpc("cancel_payment_hold", {
        p_id: bookingId,
      });
      if (error) {
        console.error("[stripe-webhook] cancel_payment_hold:", error);
        return NextResponse.json({ error: "Erreur base." }, { status: 503 });
      }
      break;
    }

    default:
      /* Autres événements : accusés de réception silencieux. */
      break;
  }

  return NextResponse.json({ received: true });
}
