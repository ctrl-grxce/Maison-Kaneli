"use client";

import { formatDateFr, formatDuration, formatTimeFr } from "@/lib/utils";
import { BRAND_LABELS, type Formation, type Service } from "@/lib/services";
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
}: StepConfirmProps) {
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
              <Row label="Tarif" value={service.price} />
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

      <p className="mt-5 text-sm leading-relaxed text-taupe">
        {mode === "prestation"
          ? "En confirmant, votre créneau est réservé et Maison Kanali reçoit immédiatement votre demande. Vous recevrez la confirmation définitive par email ou téléphone."
          : "En envoyant votre demande, Maison Kanali est immédiatement notifiée et vous recontacte pour convenir des dates et modalités de votre formation."}
      </p>
    </div>
  );
}
