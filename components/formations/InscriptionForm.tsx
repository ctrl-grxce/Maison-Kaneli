"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FORMATIONS } from "@/lib/services";

type FieldName = "firstName" | "lastName" | "email" | "phone" | "message";

type FieldErrors = Partial<Record<FieldName, string>>;

interface FieldValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY_VALUES: FieldValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

/** Mêmes règles que StepDetails.validateDetails (mode formation). */
function validateFields(values: FieldValues): FieldErrors {
  const errors: FieldErrors = {};
  const phone = values.phone.trim();

  if (values.firstName.trim().length < 2) {
    errors.firstName = "Votre prénom est requis.";
  }
  if (values.lastName.trim().length < 2) {
    errors.lastName = "Votre nom est requis.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Une adresse email valide est requise.";
  }
  if (
    !/^[+0-9 ().-]{6,20}$/.test(phone) ||
    (phone.match(/\d/g) ?? []).length < 6
  ) {
    errors.phone = "Un numéro de téléphone valide est requis.";
  }
  if (values.message.length > 800) {
    errors.message = "800 caractères maximum.";
  }
  return errors;
}

/** Pastille d'étape — l'arche signature de la maison. */
function StepBadge({ number }: { number: number }) {
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-t-full border border-bronze/60 bg-blush text-[0.7rem] text-bronze">
      {number}
    </span>
  );
}

/**
 * Formulaire d'inscription aux formations — une seule page, trois blocs
 * numérotés : formation, option, coordonnées. POST vers /api/formations.
 */
export function InscriptionForm() {
  const router = useRouter();
  const stepOneRef = useRef<HTMLDivElement>(null);

  const [formationId, setFormationId] = useState<string | null>(null);
  const [kitOptionId, setKitOptionId] = useState<string | null>(null);
  const [values, setValues] = useState<FieldValues>(EMPTY_VALUES);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [kitError, setKitError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Présélection via ?formation=… — sans useSearchParams (pas de Suspense). */
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get(
      "formation",
    );
    if (requested && FORMATIONS.some((item) => item.id === requested)) {
      setFormationId(requested);
    }
  }, []);

  const formation = FORMATIONS.find((item) => item.id === formationId) ?? null;
  const hasKitBlock = formation !== null && formation.kitOptions.length > 0;
  const detailsStepNumber = hasKitBlock ? 3 : 2;

  const handleChange = (name: FieldName, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    if (!formation) {
      setFormError("Choisissez d'abord votre formation.");
      stepOneRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const missingKit = formation.kitOptions.length > 0 && kitOptionId === null;
    if (missingKit) {
      setKitError("Choisissez votre option pour continuer.");
    }

    const nextErrors = validateFields(values);
    setErrors(nextErrors);
    if (missingKit || Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formationId: formation.id,
          kitOption: kitOptionId ?? undefined,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          message: values.message.trim() || undefined,
          website,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setSubmitting(false);
        setFormError(
          payload?.error ?? "Une erreur est survenue. Merci de réessayer.",
        );
        return;
      }

      const option = formation.kitOptions.find(
        (item) => item.id === kitOptionId,
      );
      const kitLabel = option ? `${option.label} — ${option.price}` : null;
      const params = new URLSearchParams({
        type: "f",
        ref: payload?.reference ?? "",
        s: formation.name,
      });
      if (kitLabel) {
        params.set("k", kitLabel);
      }
      router.push(`/rendez-vous/confirmation?${params.toString()}`);
    } catch {
      setSubmitting(false);
      setFormError(
        "Impossible de contacter le serveur. Vérifiez votre connexion puis réessayez.",
      );
    }
  };

  const field = (
    name: FieldName,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={`form-${name}`} className="field-label">
        {label}
      </label>
      <input
        id={`form-${name}`}
        value={values[name]}
        onChange={(event) => handleChange(name, event.target.value)}
        className={cn("field", errors[name] && "field-error")}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `form-error-${name}` : undefined}
        {...props}
      />
      {errors[name] && (
        <p id={`form-error-${name}`} className="mt-1.5 text-xs text-[#b3543f]">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-sand-deep bg-white p-6 md:p-10"
    >
      {/* ── 1. Votre formation ─────────────────────────────────────────── */}
      <div ref={stepOneRef} className="scroll-mt-24">
        <div className="flex items-center gap-3">
          <StepBadge number={1} />
          <h3 className="overline-label">Votre formation</h3>
        </div>
        <div className="mt-5 ml-4 border-l border-sand-deep/60 pl-6">
          <div className="grid gap-3">
            {FORMATIONS.map((item) => {
              const active = formationId === item.id;
              const gold = item.brand === "naftali";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFormationId(item.id);
                    setKitOptionId(null);
                    setKitError(null);
                    setFormError(null);
                  }}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-4 border p-5 text-left transition-all duration-300",
                    active
                      ? gold
                        ? "border-gold bg-[#f7f0e2]"
                        : "border-bronze bg-blush/60"
                      : "border-sand-deep bg-white hover:border-bronze/40",
                  )}
                >
                  <span className="flex-1">
                    <span className="font-display block text-lg leading-tight font-medium md:text-xl">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-sm text-taupe">
                      {item.durationLabel}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "font-display text-lg whitespace-nowrap md:text-xl",
                      gold ? "text-gold" : "text-bronze",
                    )}
                  >
                    {item.priceLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. Votre option (si la formation en propose) ───────────────── */}
      {hasKitBlock && formation && (
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <StepBadge number={2} />
            <h3 className="overline-label">Votre option</h3>
          </div>
          <div className="mt-5 ml-4 border-l border-sand-deep/60 pl-6">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {formation.kitOptions.map((option) => {
                const active = kitOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setKitOptionId(option.id);
                      setKitError(null);
                    }}
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
            {kitError && (
              <p className="mt-2 text-xs text-[#b3543f]">{kitError}</p>
            )}
          </div>
        </div>
      )}

      {/* ── 3. Vos coordonnées ─────────────────────────────────────────── */}
      <div className="mt-10">
        <div className="flex items-center gap-3">
          <StepBadge number={detailsStepNumber} />
          <h3 className="overline-label">Vos coordonnées</h3>
        </div>
        <div className="mt-5 ml-4 border-l border-sand-deep/60 pl-6">
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              {field("firstName", "Prénom *", {
                autoComplete: "given-name",
                placeholder: "Votre prénom",
              })}
              {field("lastName", "Nom *", {
                autoComplete: "family-name",
                placeholder: "Votre nom",
              })}
            </div>
            {field("email", "Email *", {
              type: "email",
              autoComplete: "email",
              inputMode: "email",
              placeholder: "vous@exemple.fr",
            })}
            {field("phone", "Téléphone *", {
              type: "tel",
              autoComplete: "tel",
              inputMode: "tel",
              placeholder: "06 12 34 56 78",
            })}

            <div>
              <label htmlFor="form-message" className="field-label">
                Votre message (optionnel)
              </label>
              <textarea
                id="form-message"
                value={values.message}
                onChange={(event) => handleChange("message", event.target.value)}
                rows={4}
                maxLength={800}
                placeholder="Vos disponibilités, votre niveau, vos objectifs…"
                className={cn(
                  "field resize-none",
                  errors.message && "field-error",
                )}
              />
              {errors.message && (
                <p className="mt-1.5 text-xs text-[#b3543f]">{errors.message}</p>
              )}
            </div>

            {/* Champ piège invisible pour les robots */}
            <div className="absolute -left-[9999px]" aria-hidden>
              <label htmlFor="form-website">Site web</label>
              <input
                id="form-website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>

            <p className="text-xs leading-relaxed text-taupe">
              * Champs requis. Vos coordonnées servent uniquement au traitement
              de votre demande d&apos;inscription par Maison Kanali.
            </p>
          </div>
        </div>
      </div>

      {/* ── Envoi ──────────────────────────────────────────────────────── */}
      <div className="mt-10 border-t border-sand-deep/70 pt-8">
        {formError && (
          <div
            role="alert"
            className="mb-5 border border-[#b3543f]/40 bg-[#b3543f]/8 px-4 py-3.5 text-sm leading-relaxed text-[#8f4332]"
          >
            {formError}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "btn btn-primary w-full sm:w-auto min-w-[16rem]",
            submitting && "cursor-wait opacity-70",
          )}
        >
          {submitting
            ? "Envoi en cours…"
            : "Envoyer ma demande d'inscription"}
        </button>
      </div>
    </form>
  );
}
