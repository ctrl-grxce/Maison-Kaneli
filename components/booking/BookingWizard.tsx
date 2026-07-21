"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  getFormation,
  getService,
  type Category,
  type Formation,
  type Service,
} from "@/lib/services";
import { Progress } from "./Progress";
import { StepService, type BookingMode } from "./StepService";
import { StepSchedule } from "./StepSchedule";
import {
  StepDetails,
  validateDetails,
  type ContactDetails,
  type DetailsErrors,
} from "./StepDetails";
import { StepConfirm } from "./StepConfirm";
import { Summary } from "./Summary";
import { ChevronLeftIcon } from "@/components/ui/icons";

const PRESTATION_STEPS = [
  "Prestation",
  "Date & heure",
  "Coordonnées",
  "Confirmation",
] as const;

const FORMATION_STEPS = ["Formation", "Coordonnées", "Confirmation"] as const;

const EMPTY_DETAILS: ContactDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
  website: "",
};

interface BookingWizardProps {
  initialServiceId?: string;
  initialFormationId?: string;
}

/** Parcours de réservation — une étape à l'écran, jamais de scroll infini. */
export function BookingWizard({
  initialServiceId,
  initialFormationId,
}: BookingWizardProps) {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);

  const initialService = initialServiceId
    ? (getService(initialServiceId) ?? null)
    : null;
  const initialFormation = initialFormationId
    ? (getFormation(initialFormationId) ?? null)
    : null;

  const [mode, setMode] = useState<BookingMode>(
    initialFormation ? "formation" : "prestation",
  );
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<Category | null>(
    initialService?.category ?? null,
  );
  const [service, setService] = useState<Service | null>(initialService);
  const [formation, setFormation] = useState<Formation | null>(initialFormation);
  const [kitOptionId, setKitOptionId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<ContactDetails>(EMPTY_DETAILS);
  const [errors, setErrors] = useState<DetailsErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const labels = mode === "prestation" ? PRESTATION_STEPS : FORMATION_STEPS;
  const stepKey =
    mode === "prestation"
      ? (["service", "schedule", "details", "confirm"] as const)[step]
      : (["service", "details", "confirm"] as const)[step];

  const kitLabel = useMemo(() => {
    if (!formation || !kitOptionId) return null;
    const option = formation.kitOptions.find((item) => item.id === kitOptionId);
    return option ? `${option.label} — ${option.price}` : null;
  }, [formation, kitOptionId]);

  const goTo = (next: number) => {
    setStep(next);
    setSubmitError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const canContinue = (() => {
    switch (stepKey) {
      case "service":
        if (mode === "formation") {
          if (!formation) return false;
          return formation.kitOptions.length === 0 || kitOptionId !== null;
        }
        return service !== null;
      case "schedule":
        return date !== null && time !== null;
      case "details":
        return true; // validation à l'appui sur Continuer
      default:
        return true;
    }
  })();

  const handleContinue = () => {
    if (stepKey === "details") {
      const nextErrors = validateDetails(details);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }
    goTo(step + 1);
  };

  const handleModeChange = (nextMode: BookingMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    setStep(0);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const isPrestation = mode === "prestation";
    const endpoint = isPrestation ? "/api/bookings" : "/api/formations";
    const body = isPrestation
      ? {
          serviceId: service?.id,
          date,
          time,
          firstName: details.firstName.trim(),
          lastName: details.lastName.trim(),
          email: details.email.trim(),
          phone: details.phone.trim(),
          notes: details.notes.trim() || undefined,
          website: details.website,
        }
      : {
          formationId: formation?.id,
          kitOption: kitOptionId ?? undefined,
          firstName: details.firstName.trim(),
          lastName: details.lastName.trim(),
          email: details.email.trim(),
          phone: details.phone.trim(),
          message: details.notes.trim() || undefined,
          website: details.website,
        };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => null);

      if (response.status === 409) {
        setTime(null);
        setSubmitting(false);
        setSubmitError(
          payload?.error ??
            "Ce créneau vient d'être réservé. Merci d'en choisir un autre.",
        );
        goTo(1); // retour au choix du créneau, disponibilités rafraîchies
        return;
      }

      if (!response.ok) {
        setSubmitting(false);
        setSubmitError(
          payload?.error ?? "Une erreur est survenue. Merci de réessayer.",
        );
        return;
      }

      const params = new URLSearchParams({
        type: isPrestation ? "p" : "f",
        ref: payload?.reference ?? "",
        s: isPrestation ? (service?.name ?? "") : (formation?.name ?? ""),
      });
      if (isPrestation && date && time) {
        params.set("d", date);
        params.set("t", time);
      }
      if (!isPrestation && kitLabel) {
        params.set("k", kitLabel);
      }
      router.push(`/rendez-vous/confirmation?${params.toString()}`);
    } catch {
      setSubmitting(false);
      setSubmitError(
        "Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.",
      );
    }
  };

  return (
    <div ref={topRef} className="scroll-mt-24">
      <Progress labels={labels} current={step} onNavigate={goTo} />

      {submitError && (
        <div
          role="alert"
          className="mt-6 border border-[#b3543f]/40 bg-[#b3543f]/8 px-4 py-3.5 text-sm leading-relaxed text-[#8f4332]"
        >
          {submitError}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div>
          {stepKey === "service" && (
            <StepService
              mode={mode}
              onModeChange={handleModeChange}
              category={category}
              onCategoryChange={(next) => {
                setCategory(next);
                setService(null);
                setDate(null);
                setTime(null);
              }}
              service={service}
              onServiceChange={(next) => {
                setService(next);
                setTime(null);
              }}
              formation={formation}
              onFormationChange={(next) => {
                setFormation(next);
                setKitOptionId(null);
              }}
              kitOptionId={kitOptionId}
              onKitOptionChange={setKitOptionId}
            />
          )}

          {stepKey === "schedule" && service && (
            <StepSchedule
              service={service}
              date={date}
              time={time}
              onDateChange={(next) => {
                setDate(next);
                setTime(null);
              }}
              onTimeChange={setTime}
            />
          )}

          {stepKey === "details" && (
            <StepDetails
              mode={mode}
              details={details}
              errors={errors}
              onChange={(field, value) => {
                setDetails((previous) => ({ ...previous, [field]: value }));
                setErrors((previous) => ({ ...previous, [field]: undefined }));
              }}
            />
          )}

          {stepKey === "confirm" && (
            <StepConfirm
              mode={mode}
              service={service}
              formation={formation}
              kitLabel={kitLabel}
              date={date}
              time={time}
              details={details}
            />
          )}

          {/* ── Navigation ─────────────────────────────────────────────── */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-sand-deep pt-6">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="link-line text-taupe"
              >
                <ChevronLeftIcon width={14} height={14} />
                Retour
              </button>
            ) : (
              <span />
            )}

            {stepKey !== "confirm" ? (
              <button
                type="button"
                onClick={handleContinue}
                disabled={!canContinue}
                className={cn(
                  "btn btn-primary min-w-[11rem]",
                  !canContinue && "cursor-not-allowed opacity-40",
                )}
              >
                Continuer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className={cn(
                  "btn btn-primary min-w-[13rem]",
                  submitting && "cursor-wait opacity-70",
                )}
              >
                {submitting
                  ? "Envoi en cours…"
                  : mode === "prestation"
                    ? "Confirmer le rendez-vous"
                    : "Envoyer ma demande"}
              </button>
            )}
          </div>
        </div>

        <Summary
          mode={mode}
          service={service}
          formation={formation}
          kitLabel={kitLabel}
          date={date}
          time={time}
        />
      </div>
    </div>
  );
}
