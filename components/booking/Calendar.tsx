"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { OPENING } from "@/lib/config";
import { addDays, isBookableDate, parisNow } from "@/lib/availability";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";

interface CalendarProps {
  selected: string | null;
  onSelect: (isoDate: string) => void;
}

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"] as const;
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

/** Calendrier mensuel — dimanches fermés, passé et horizon désactivés.
 *  Toutes les dates sont calculées en heure de Paris, comme côté serveur. */
export function Calendar({ selected, onSelect }: CalendarProps) {
  // Figé au premier rendu : la référence « aujourd'hui » du showroom.
  const [todayIso] = useState(() => parisNow().date);
  const horizonIso = addDays(todayIso, OPENING.horizonDays);

  const initial = selected ?? todayIso;
  const [view, setView] = useState({
    year: Number(initial.slice(0, 4)),
    month: Number(initial.slice(5, 7)) - 1,
  });

  const cells = useMemo(() => {
    const first = new Date(view.year, view.month, 1);
    const leading = (first.getDay() + 6) % 7; // semaine française (lundi)
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    return [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [view]);

  const todayYear = Number(todayIso.slice(0, 4));
  const todayMonth = Number(todayIso.slice(5, 7)) - 1;
  const horizonYear = Number(horizonIso.slice(0, 4));
  const horizonMonth = Number(horizonIso.slice(5, 7)) - 1;

  const canGoPrev =
    view.year > todayYear ||
    (view.year === todayYear && view.month > todayMonth);
  const canGoNext =
    view.year < horizonYear ||
    (view.year === horizonYear && view.month < horizonMonth);

  const shift = (delta: number) => {
    setView(({ year, month }) => {
      const date = new Date(year, month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  };

  return (
    <div className="border border-sand-deep bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canGoPrev}
          aria-label="Mois précédent"
          className="flex h-10 w-10 items-center justify-center text-espresso transition-opacity disabled:opacity-25"
        >
          <ChevronLeftIcon width={18} height={18} />
        </button>
        <p className="font-display text-xl font-medium">
          {MONTHS[view.month]} {view.year}
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canGoNext}
          aria-label="Mois suivant"
          className="flex h-10 w-10 items-center justify-center text-espresso transition-opacity disabled:opacity-25"
        >
          <ChevronRightIcon width={18} height={18} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center">
        {WEEKDAYS.map((day, index) => (
          <span
            key={`${day}-${index}`}
            className="pb-2 text-[0.62rem] tracking-[0.2em] text-taupe uppercase"
          >
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`blank-${index}`} aria-hidden />;
          }
          const iso = toIso(view.year, view.month, day);
          const disabled = !isBookableDate(iso, todayIso);
          const isSelected = iso === selected;
          const isToday = iso === todayIso;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(iso)}
              aria-pressed={isSelected}
              className={cn(
                "mx-auto my-0.5 flex h-10 w-10 items-center justify-center text-sm transition-all duration-300",
                isSelected
                  ? "rounded-t-full bg-bronze text-ivory"
                  : disabled
                    ? "text-sand-deep"
                    : "rounded-t-full text-espresso hover:bg-sand",
                isToday && !isSelected && "font-medium text-bronze",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="mt-3 border-t border-sand-deep/70 pt-3 text-center text-[0.65rem] tracking-[0.14em] text-taupe uppercase">
        Fermé le dimanche
      </p>
    </div>
  );
}
