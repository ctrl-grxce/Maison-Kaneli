"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PaymentStatusProps {
  bookingId: string;
}

type State = "checking" | "confirmed" | "processing" | "cancelled";

/**
 * Retour de la page de paiement : vérifie auprès du serveur que le paiement
 * est bien confirmé (c'est le webhook Stripe qui fait foi — il peut avoir
 * une seconde ou deux de retard, d'où les quelques tentatives).
 */
export function PaymentStatus({ bookingId }: PaymentStatusProps) {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      attempts += 1;
      try {
        const response = await fetch(
          `/api/bookings/status?id=${encodeURIComponent(bookingId)}`,
        );
        const payload = await response.json().catch(() => null);
        if (cancelled) return;

        if (payload?.status === "confirmed") {
          setState("confirmed");
          return;
        }
        if (payload?.status === "cancelled") {
          setState("cancelled");
          return;
        }
      } catch {
        /* réseau capricieux — on retentera */
      }
      if (cancelled) return;
      if (attempts < 8) {
        setTimeout(check, 1500);
      } else {
        setState("processing");
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (state === "checking") {
    return (
      <p
        className="mt-7 max-w-md text-sm leading-relaxed text-taupe"
        role="status"
      >
        Validation de votre paiement en cours…
      </p>
    );
  }

  if (state === "confirmed") {
    return (
      <p
        className="mt-7 max-w-md text-sm leading-relaxed text-taupe"
        role="status"
      >
        <span className="text-bronze">Votre acompte est bien reçu</span> — le
        rendez-vous est confirmé. Votre ticket de réservation, votre facture
        d&apos;acompte et l&apos;invitation calendrier arrivent par email dans
        un instant.
      </p>
    );
  }

  if (state === "cancelled") {
    return (
      <div className="mt-7 max-w-md text-sm leading-relaxed text-taupe">
        <p>
          Ce paiement n&apos;a pas abouti et le créneau a été libéré. Rien
          n&apos;a été débité durablement — vous pouvez reprendre votre
          réservation.
        </p>
        <Link href="/rendez-vous" className="btn btn-outline mt-5">
          Reprendre ma réservation
        </Link>
      </div>
    );
  }

  return (
    <p
      className="mt-7 max-w-md text-sm leading-relaxed text-taupe"
      role="status"
    >
      Votre paiement est accepté et sa validation se termine — vos emails de
      confirmation (ticket, facture d&apos;acompte, invitation calendrier)
      arrivent dans quelques minutes. Inutile de payer à nouveau.
    </p>
  );
}
