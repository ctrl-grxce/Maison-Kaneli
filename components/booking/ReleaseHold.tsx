"use client";

import { useEffect } from "react";

/**
 * Retour « annuler » de la page de paiement : libère tout de suite le
 * créneau bloqué, sans attendre l'expiration automatique. Sans danger —
 * le serveur n'annule que les réservations encore en attente de paiement.
 */
export function ReleaseHold({ bookingId }: { bookingId: string }) {
  useEffect(() => {
    fetch("/api/bookings/cancel-hold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    }).catch(() => {
      /* Peu grave : l'expiration automatique libérera le créneau. */
    });
  }, [bookingId]);

  return null;
}
