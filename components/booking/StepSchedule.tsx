"use client";

import { useEffect, useState } from "react";
import { cn, formatDateFr, formatTimeFr } from "@/lib/utils";
import type { Service } from "@/lib/services";
import type { Slot } from "@/lib/availability";
import { Calendar } from "./Calendar";

interface StepScheduleProps {
  service: Service;
  date: string | null;
  time: string | null;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

/** Étape 2 — choix de la date puis du créneau (disponibilité en direct). */
export function StepSchedule({
  service,
  date,
  time,
  onDateChange,
  onTimeChange,
}: StepScheduleProps) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSlots(null);

    fetch(
      `/api/availability?date=${date}&serviceId=${encodeURIComponent(service.id)}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "Erreur de chargement");
        }
        return response.json();
      })
      .then((body: { closed: boolean; slots: Slot[] }) => {
        setSlots(body.closed ? [] : body.slots);
        setLoading(false);
      })
      .catch((fetchError: Error) => {
        if (fetchError.name === "AbortError") return;
        setError(fetchError.message);
        setLoading(false);
      });

    return () => controller.abort();
  }, [date, service.id]);

  const available = slots?.filter((slot) => slot.available) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <p className="field-label">Choisissez votre date</p>
        <Calendar selected={date} onSelect={onDateChange} />
      </div>

      <div>
        <p className="field-label">Choisissez votre créneau</p>
        <div className="border border-sand-deep bg-white p-4 sm:p-5">
          {!date ? (
            <p className="py-10 text-center text-sm text-taupe">
              Sélectionnez d&apos;abord une date dans le calendrier.
            </p>
          ) : loading ? (
            <div
              className="grid grid-cols-3 gap-2 sm:grid-cols-4"
              aria-label="Chargement des créneaux"
            >
              {Array.from({ length: 8 }, (_, index) => (
                <span
                  key={index}
                  className="h-11 animate-pulse rounded-[2px] bg-sand"
                />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[#b3543f]">{error}</p>
              <button
                type="button"
                onClick={() => onDateChange(date)}
                className="link-line mt-4 text-bronze"
              >
                Réessayer
              </button>
            </div>
          ) : slots && slots.length === 0 ? (
            <p className="py-10 text-center text-sm text-taupe">
              Le showroom est fermé ce jour-là. Choisissez une autre date.
            </p>
          ) : slots && available.length === 0 ? (
            <p className="py-10 text-center text-sm leading-relaxed text-taupe">
              Cette journée est déjà complète.
              <br />
              Merci de choisir une autre date.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-taupe">
                {formatDateFr(date)} —{" "}
                <span className="text-espresso">
                  {available.length} créneau{available.length > 1 ? "x" : ""}{" "}
                  disponible{available.length > 1 ? "s" : ""}
                </span>
              </p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots?.map((slot) => {
                  const active = time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => onTimeChange(slot.time)}
                      aria-pressed={active}
                      aria-label={
                        slot.available
                          ? `Créneau de ${formatTimeFr(slot.time)}`
                          : `${formatTimeFr(slot.time)} — indisponible`
                      }
                      className={cn(
                        "flex h-11 items-center justify-center rounded-[2px] border text-sm transition-all duration-300",
                        active
                          ? "border-bronze bg-bronze text-ivory"
                          : slot.available
                            ? "border-sand-deep bg-white text-espresso hover:border-bronze/50 hover:bg-blush/50"
                            : "cursor-not-allowed border-sand-deep/60 bg-sand/60 text-taupe/50 line-through",
                      )}
                    >
                      {formatTimeFr(slot.time)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-[0.68rem] tracking-[0.14em] text-taupe uppercase">
                Les créneaux barrés sont déjà réservés
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
