"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";

interface ProgressProps {
  labels: readonly string[];
  current: number;
  onNavigate: (step: number) => void;
}

/** Indicateur d'étapes : détaillé en desktop, compact en mobile. */
export function Progress({ labels, current, onNavigate }: ProgressProps) {
  return (
    <div aria-label={`Étape ${current + 1} sur ${labels.length}`}>
      {/* Mobile — barre fine + libellé */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between">
          <p className="overline-label">
            Étape {current + 1}/{labels.length}
          </p>
          <p className="font-display text-lg font-medium">{labels[current]}</p>
        </div>
        <div className="mt-3 flex gap-1.5">
          {labels.map((label, index) => (
            <span
              key={label}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors duration-500",
                index <= current ? "bg-bronze" : "bg-sand-deep",
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop — étapes nommées */}
      <ol className="hidden items-center gap-3 md:flex">
        {labels.map((label, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li key={label} className="flex flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => done && onNavigate(index)}
                disabled={!done}
                className={cn(
                  "flex items-center gap-2.5",
                  done && "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-t-full border text-[0.7rem] transition-colors duration-500",
                    active && "border-bronze bg-bronze text-ivory",
                    done && "border-bronze/60 bg-blush text-bronze",
                    !active && !done && "border-sand-deep text-taupe",
                  )}
                >
                  {done ? <CheckIcon width={14} height={14} /> : index + 1}
                </span>
                <span
                  className={cn(
                    "text-[0.68rem] tracking-[0.16em] uppercase transition-colors duration-500",
                    active ? "text-espresso" : "text-taupe",
                  )}
                >
                  {label}
                </span>
              </button>
              {index < labels.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "hairline flex-1",
                    index < current && "bg-bronze/50",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
