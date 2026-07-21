"use client";

import { cn } from "@/lib/utils";
import type { BookingMode } from "./StepService";

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  /** Champ piège anti-robots — jamais visible, jamais rempli par un humain. */
  website: string;
}

export type DetailsErrors = Partial<Record<keyof ContactDetails, string>>;

export function validateDetails(details: ContactDetails): DetailsErrors {
  const errors: DetailsErrors = {};
  if (details.firstName.trim().length < 2) {
    errors.firstName = "Votre prénom est requis.";
  }
  if (details.lastName.trim().length < 2) {
    errors.lastName = "Votre nom est requis.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(details.email.trim())) {
    errors.email = "Une adresse email valide est requise.";
  }
  if (!/^[+0-9 ().-]{6,20}$/.test(details.phone.trim())) {
    errors.phone = "Un numéro de téléphone valide est requis.";
  }
  if (details.notes.length > 500) {
    errors.notes = "500 caractères maximum.";
  }
  return errors;
}

interface StepDetailsProps {
  mode: BookingMode;
  details: ContactDetails;
  errors: DetailsErrors;
  onChange: (field: keyof ContactDetails, value: string) => void;
}

/** Étape 3 — coordonnées de la cliente (ou de l'élève). */
export function StepDetails({ mode, details, errors, onChange }: StepDetailsProps) {
  const field = (
    name: keyof ContactDetails,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={`field-${name}`} className="field-label">
        {label}
      </label>
      <input
        id={`field-${name}`}
        value={details[name]}
        onChange={(event) => onChange(name, event.target.value)}
        className={cn("field", errors[name] && "field-error")}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `error-${name}` : undefined}
        {...props}
      />
      {errors[name] && (
        <p id={`error-${name}`} className="mt-1.5 text-xs text-[#b3543f]">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
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
        <label htmlFor="field-notes" className="field-label">
          {mode === "formation"
            ? "Votre message (optionnel)"
            : "Précisions (optionnel)"}
        </label>
        <textarea
          id="field-notes"
          value={details.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          rows={4}
          maxLength={mode === "formation" ? 800 : 500}
          placeholder={
            mode === "formation"
              ? "Vos disponibilités, votre niveau, vos objectifs…"
              : "Envie particulière, nail art, allergie, question…"
          }
          className={cn("field resize-none", errors.notes && "field-error")}
        />
      </div>

      {/* Champ piège invisible pour les robots */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="field-website">Site web</label>
        <input
          id="field-website"
          tabIndex={-1}
          autoComplete="off"
          value={details.website}
          onChange={(event) => onChange("website", event.target.value)}
        />
      </div>

      <p className="text-xs leading-relaxed text-taupe">
        * Champs requis. Vos coordonnées servent uniquement à la gestion de
        votre rendez-vous par Maison Kanali.
      </p>
    </div>
  );
}
