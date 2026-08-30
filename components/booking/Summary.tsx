"use client";

import { formatDateFr, formatDuration, formatTimeFr } from "@/lib/utils";
import { CONTACT } from "@/lib/config";
import {
  BRAND_LABELS,
  effectivePrice,
  formatEuros,
  remainderLabelFor,
  type Formation,
  type Service,
} from "@/lib/services";
import type { BookingMode } from "./StepService";
import { CalendarIcon, ClockIcon, SparkleIcon } from "@/components/ui/icons";

interface SummaryProps {
  mode: BookingMode;
  service: Service | null;
  formation: Formation | null;
  kitLabel: string | null;
  date: string | null;
  time: string | null;
  /** Acompte à régler en ligne, en centimes (0 = pas de paiement en ligne). */
  depositCents?: number;
}

/** Récapitulatif latéral (desktop) — se remplit au fil du parcours. */
export function Summary({
  mode,
  service,
  formation,
  kitLabel,
  date,
  time,
  depositCents = 0,
}: SummaryProps) {
  return (
    <aside className="sticky top-24 hidden h-fit border border-sand-deep bg-sand p-6 lg:block">
      <p className="overline-label text-[0.62rem]">Votre rendez-vous</p>

      {mode === "prestation" ? (
        service ? (
          <div className="mt-4">
            <p className="text-[0.65rem] tracking-[0.16em] text-taupe uppercase">
              {BRAND_LABELS[service.brand]}
            </p>
            <p className="font-display mt-1 text-2xl leading-tight font-medium">
              {service.name}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-taupe">
              <ClockIcon width={15} height={15} />
              {formatDuration(service.durationMin)}
              <span aria-hidden>·</span>
              <span className="text-bronze">{effectivePrice(service).label}</span>
            </p>
            {effectivePrice(service).promo && (
              <p className="mt-2 inline-flex rounded-full border border-gold/50 bg-gold/10 px-2.5 py-0.5 text-[0.56rem] tracking-[0.14em] text-gold uppercase">
                Promo · {effectivePrice(service).promo?.until}
              </p>
            )}
            {depositCents > 0 && (
              <p className="mt-2 text-[0.8rem] leading-relaxed text-taupe">
                Acompte en ligne :{" "}
                <span className="text-bronze">{formatEuros(depositCents)}</span>
                {remainderLabelFor(effectivePrice(service).label, depositCents) && (
                  <>
                    {" "}
                    · Reste sur place :{" "}
                    {remainderLabelFor(effectivePrice(service).label, depositCents)}
                  </>
                )}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-taupe">
            Choisissez d&apos;abord votre prestation — le récapitulatif se
            complète au fil de votre parcours.
          </p>
        )
      ) : formation ? (
        <div className="mt-4">
          <p className="text-[0.65rem] tracking-[0.16em] text-taupe uppercase">
            Formation professionnelle
          </p>
          <p className="font-display mt-1 text-2xl leading-tight font-medium">
            {formation.name}
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-taupe">
            <SparkleIcon width={15} height={15} />
            {kitLabel ?? formation.priceLabel}
          </p>
        </div>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-taupe">
          Choisissez votre formation — le récapitulatif se complète au fil de
          votre parcours.
        </p>
      )}

      {mode === "prestation" && (date || time) && (
        <div className="mt-5 border-t border-sand-deep pt-4">
          {date && (
            <p className="flex items-center gap-2 text-sm">
              <CalendarIcon width={15} height={15} className="text-bronze" />
              {formatDateFr(date)}
            </p>
          )}
          {time && (
            <p className="mt-2 flex items-center gap-2 text-sm">
              <ClockIcon width={15} height={15} className="text-bronze" />
              {formatTimeFr(time)}
            </p>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-sand-deep pt-4">
        <p className="text-[0.65rem] leading-relaxed tracking-[0.14em] text-taupe uppercase">
          {CONTACT.scheduleLabel}
          <br />
          Saint-Quentin · Sur rendez-vous
        </p>
      </div>
    </aside>
  );
}
