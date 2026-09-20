"use client";

import Link from "next/link";
import { formatDateFr, formatDuration, formatTimeFr } from "@/lib/utils";
import {
  BRAND_LABELS,
  bookingPriceLabel,
  depositNotice,
  effectivePrice,
  formatEuros,
  remainderLabelFor,
  type Formation,
  type Service,
} from "@/lib/services";
import type { BookingMode } from "./StepService";
import type { ContactDetails } from "./StepDetails";

interface StepConfirmProps {
  mode: BookingMode;
  service: Service | null;
  formation: Formation | null;
  kitLabel: string | null;
  date: string | null;
  time: string | null;
  details: ContactDetails;
  /** Acompte à régler en ligne, en centimes (0 = pas de paiement en ligne). */
  depositCents?: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <dt className="text-[0.68rem] tracking-[0.18em] whitespace-nowrap text-taupe uppercase">
        {label}
      </dt>
      <dd className="text-right text-[0.9375rem] leading-snug">{value}</dd>
    </div>
  );
}

/** Étape finale — récapitulatif complet avant envoi. */
export function StepConfirm({
  mode,
  service,
  formation,
  kitLabel,
  date,
  time,
  details,
  depositCents = 0,
}: StepConfirmProps) {
  const remainderLabel =
    service && depositCents > 0
      ? remainderLabelFor(effectivePrice(service).label, depositCents)
      : null;

  return (
    <div>
      <div className="border border-sand-deep bg-white">
        <div className="border-b border-sand-deep bg-blush/50 px-5 py-4">
          <p className="overline-label text-[0.62rem]">Votre récapitulatif</p>
        </div>
        <dl className="divide-y divide-sand-deep/70 px-5">
          {mode === "prestation" && service ? (
            <>
              <Row label="Pôle" value={BRAND_LABELS[service.brand]} />
              <Row label="Prestation" value={service.name} />
              <Row label="Durée" value={formatDuration(service.durationMin)} />
              <Row label="Tarif de la prestation" value={bookingPriceLabel(service)} />
              {date && <Row label="Date" value={formatDateFr(date)} />}
              {time && <Row label="Heure" value={formatTimeFr(time)} />}
            </>
          ) : formation ? (
            <>
              <Row label="Formation" value={formation.name} />
              <Row label="Format" value={formation.durationLabel} />
              <Row label="Tarif" value={kitLabel ?? formation.priceLabel} />
            </>
          ) : null}
          <Row
            label="Identité"
            value={`${details.firstName} ${details.lastName}`.trim()}
          />
          <Row label="Email" value={details.email} />
          <Row label="Téléphone" value={details.phone} />
          {details.notes.trim() && (
            <Row label="Précisions" value={details.notes.trim()} />
          )}
        </dl>
      </div>

      {mode === "prestation" && depositCents > 0 && (
        <div className="mt-5 border border-bronze/45 bg-blush/60 p-5">
          <p className="overline-label text-[0.62rem] text-bronze-dark">
            Ce que vous payez maintenant
          </p>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <span className="text-sm leading-snug">
              Acompte, à payer en ligne
            </span>
            <span className="font-display text-3xl leading-none font-medium whitespace-nowrap text-bronze-dark">
              {formatEuros(depositCents)}
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-sand-deep pt-3">
            <span className="text-sm leading-snug">
              {remainderLabel
                ? "Reste à régler sur place, le jour du rendez-vous"
                : "Le reste se règle sur place, le jour du rendez-vous"}
            </span>
            {remainderLabel && (
              <span className="font-display text-2xl leading-none font-medium whitespace-nowrap">
                {remainderLabel}
              </span>
            )}
          </div>
          <p className="mt-4 border-t border-sand-deep pt-3 text-xs leading-relaxed text-taupe">
            {depositNotice(depositCents, remainderLabel)}
          </p>
        </div>
      )}

      <p className="mt-5 text-sm leading-relaxed text-taupe">
        {mode === "prestation"
          ? depositCents > 0
            ? `En confirmant, vous êtes conduite vers la page de paiement sécurisée (carte bancaire, Apple Pay ou Google Pay) pour régler l'acompte. Votre créneau y est bloqué le temps du paiement. Votre confirmation et vos documents arrivent par email dès le paiement validé.`
            : "En confirmant, votre créneau est réservé et Maison Kanali reçoit immédiatement votre demande. Vous recevrez la confirmation définitive par email ou téléphone."
          : "En envoyant votre demande, Maison Kanali est immédiatement notifiée et vous recontacte pour convenir des dates et modalités de votre formation."}
      </p>

      {mode === "prestation" && depositCents > 0 && (
        <p className="mt-3 text-xs leading-relaxed text-taupe">
          Annulation ou report possible sans frais jusqu’à 48 h avant le
          rendez-vous — au-delà, l’acompte reste acquis. En confirmant, vous
          acceptez nos{" "}
          <Link
            href="/cgv"
            className="underline underline-offset-2 transition-colors duration-300 hover:text-espresso"
          >
            conditions générales de vente
          </Link>
          .
        </p>
      )}
    </div>
  );
}
