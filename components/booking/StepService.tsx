"use client";

import { cn, formatDuration } from "@/lib/utils";
import {
  CATEGORIES,
  FORMATIONS,
  SERVICES,
  type Category,
  type Formation,
  type Service,
} from "@/lib/services";
import { CheckIcon, DiplomaIcon, EyeIcon, HandsIcon, BrushIcon } from "@/components/ui/icons";

export type BookingMode = "prestation" | "formation";

interface StepServiceProps {
  mode: BookingMode;
  onModeChange: (mode: BookingMode) => void;
  category: Category | null;
  onCategoryChange: (category: Category) => void;
  service: Service | null;
  onServiceChange: (service: Service) => void;
  formation: Formation | null;
  onFormationChange: (formation: Formation) => void;
  kitOptionId: string | null;
  onKitOptionChange: (id: string) => void;
}

const CATEGORY_ICONS = {
  ongles: HandsIcon,
  maquillage: BrushIcon,
  cils: EyeIcon,
} as const;

/** Étape 1 — choix de la prestation (ou de la formation). */
export function StepService({
  mode,
  onModeChange,
  category,
  onCategoryChange,
  service,
  onServiceChange,
  formation,
  onFormationChange,
  kitOptionId,
  onKitOptionChange,
}: StepServiceProps) {
  return (
    <div>
      {/* ── Prestation / Formation ──────────────────────────────────────── */}
      <div
        role="tablist"
        aria-label="Type de rendez-vous"
        className="grid grid-cols-2 border border-sand-deep"
      >
        {(
          [
            { id: "prestation", label: "Une prestation" },
            { id: "formation", label: "Une formation" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={mode === tab.id}
            onClick={() => onModeChange(tab.id)}
            className={cn(
              "min-h-12 px-4 text-[0.7rem] tracking-[0.18em] uppercase transition-colors duration-300",
              mode === tab.id
                ? "bg-espresso text-ivory"
                : "bg-white text-taupe hover:text-espresso",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "prestation" ? (
        <>
          {/* ── Univers ─────────────────────────────────────────────────── */}
          <p className="field-label mt-8">Choisissez votre univers</p>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {CATEGORIES.map((item) => {
              const Icon = CATEGORY_ICONS[item.id];
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onCategoryChange(item.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-3 border p-4 text-left transition-all duration-300 sm:flex-col sm:items-start sm:gap-4 sm:p-5",
                    active
                      ? "border-bronze bg-blush/60"
                      : "border-sand-deep bg-white hover:border-bronze/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-t-full border transition-colors duration-300",
                      active
                        ? "border-bronze/50 bg-white text-bronze"
                        : "border-sand-deep bg-ivory text-taupe",
                    )}
                  >
                    <Icon width={21} height={21} />
                  </span>
                  <span>
                    <span className="font-display block text-lg leading-tight font-medium">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[0.65rem] tracking-[0.14em] text-taupe uppercase">
                      {item.brandLabel}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Prestations de l'univers ────────────────────────────────── */}
          {category && (
            <>
              <p className="field-label mt-8">Choisissez votre prestation</p>
              <ul className="divide-y divide-sand-deep/70 border border-sand-deep bg-white">
                {SERVICES.filter((item) => item.category === category).map(
                  (item) => {
                    const active = service?.id === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onServiceChange(item)}
                          aria-pressed={active}
                          className={cn(
                            "flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-300 sm:px-5",
                            active ? "bg-blush/60" : "hover:bg-ivory",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                              active
                                ? "border-bronze bg-bronze text-ivory"
                                : "border-sand-deep",
                            )}
                          >
                            {active && <CheckIcon width={11} height={11} />}
                          </span>
                          <span className="flex-1">
                            <span className="font-display block text-lg leading-tight font-medium">
                              {item.name}
                            </span>
                            <span className="mt-0.5 block text-[0.68rem] tracking-[0.14em] text-taupe uppercase">
                              {formatDuration(item.durationMin)}
                            </span>
                          </span>
                          <span className="font-display text-lg whitespace-nowrap text-bronze">
                            {item.price}
                          </span>
                        </button>
                      </li>
                    );
                  },
                )}
              </ul>
            </>
          )}
        </>
      ) : (
        <>
          {/* ── Formations ──────────────────────────────────────────────── */}
          <p className="field-label mt-8">Choisissez votre formation</p>
          <div className="grid gap-3">
            {FORMATIONS.map((item) => {
              const active = formation?.id === item.id;
              const gold = item.brand === "naftali";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onFormationChange(item)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-4 border p-5 text-left transition-all duration-300",
                    active
                      ? gold
                        ? "border-gold bg-[#f7f0e2]"
                        : "border-bronze bg-blush/60"
                      : "border-sand-deep bg-white hover:border-bronze/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-t-full border",
                      gold
                        ? "border-gold/40 bg-ivory text-gold"
                        : "border-sand-deep bg-ivory text-bronze",
                    )}
                  >
                    <DiplomaIcon width={21} height={21} />
                  </span>
                  <span className="flex-1">
                    <span className="font-display block text-lg leading-tight font-medium">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-sm text-taupe">
                      {item.durationLabel}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-display text-lg whitespace-nowrap",
                      gold ? "text-gold" : "text-bronze",
                    )}
                  >
                    {item.priceLabel}
                  </span>
                </button>
              );
            })}
          </div>

          {formation && formation.kitOptions.length > 0 && (
            <>
              <p className="field-label mt-7">Votre option</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {formation.kitOptions.map((option) => {
                  const active = kitOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onKitOptionChange(option.id)}
                      aria-pressed={active}
                      className={cn(
                        "flex items-center justify-between border px-4 py-3.5 transition-all duration-300",
                        active
                          ? "border-bronze bg-blush/60"
                          : "border-sand-deep bg-white hover:border-bronze/40",
                      )}
                    >
                      <span className="text-sm">{option.label}</span>
                      <span className="font-display text-lg text-bronze">
                        {option.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <p className="mt-6 text-sm leading-relaxed text-taupe">
            Pas de créneau à choisir : après votre demande, Maison Kanali vous
            recontacte pour convenir ensemble des dates de formation.
          </p>
        </>
      )}
    </div>
  );
}
