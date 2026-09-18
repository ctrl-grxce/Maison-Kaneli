"use client";

/**
 * Espace de gestion de Maison Kanali — réservé à Kandy & Nafi.
 *
 * Un seul écran, pensé pour le téléphone : connexion par code secret, puis
 * deux onglets — les réservations (voir, annuler, déplacer) et les
 * indisponibilités (bloquer un jour ou une plage d'heures).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { cn, formatDateFr, formatTimeFr, formatDuration } from "@/lib/utils";
import { OPENING } from "@/lib/config";
import { minutesToTime } from "@/lib/availability";
import { Calendar } from "@/components/booking/Calendar";

/* ── Icônes locales ──────────────────────────────────────────── */
/* Définies ici plutôt que dans components/ui/icons.tsx : elles ne servent
 * qu'à cet écran privé, inutile de les exposer à tout le site. */

const iconBase = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const EyeIcon = () => (
  <svg {...iconBase}>
    <path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3.1" />
  </svg>
);

const EyeOffIcon = () => (
  <svg {...iconBase}>
    <path d="M9.9 5.2A9.6 9.6 0 0 1 12 5c6 0 9.5 6.2 9.5 6.2a17 17 0 0 1-3 3.7" />
    <path d="M6.4 7.3A17 17 0 0 0 2.5 11.2S6 17.4 12 17.4a9.4 9.4 0 0 0 3.7-.73" />
    <path d="M10.1 9.6a3.1 3.1 0 0 0 4.2 4.4" />
    <path d="m3.5 3.5 17 17" />
  </svg>
);

const SearchIcon = () => (
  <svg {...iconBase}>
    <circle cx="11" cy="11" r="6.2" />
    <path d="m15.6 15.6 4.2 4.2" />
  </svg>
);


/* ── Types renvoyés par /api/gestion ─────────────────────────────────────── */

interface BookingRow {
  id: string;
  reference: string;
  service_id: string;
  service_name: string;
  brand: "kandylove" | "naftali";
  price_label: string;
  duration_min: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string | null;
  status: "pending" | "awaiting_payment" | "confirmed" | "cancelled";
  deposit_cents: number;
  invoice_number: string | null;
  paid_at: string | null;
  expired: boolean;
}

interface BlockedRow {
  id: string;
  day: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

interface Slot {
  time: string;
  available: boolean;
}

const BRAND_LABEL: Record<BookingRow["brand"], string> = {
  kandylove: "Kandylove Beauty",
  naftali: "Naftali",
};

/* Pastille colorée par pôle : sur une journée chargée, c'est ce qui permet
 *  de repérer « mes » rendez-vous sans lire chaque ligne. */
const BRAND_TONE: Record<BookingRow["brand"], string> = {
  kandylove: "bg-blush text-bronze-dark",
  naftali: "bg-[#f4ecdc] text-[#8a6d2f]",
};

function statusLabel(row: BookingRow): { text: string; tone: string } {
  if (row.status === "cancelled")
    return { text: "Annulée", tone: "bg-sand text-taupe" };
  if (row.status === "awaiting_payment")
    return row.expired
      ? { text: "Paiement non abouti", tone: "bg-sand text-taupe" }
      : { text: "Paiement en cours", tone: "bg-blush text-bronze-dark" };
  if (row.status === "confirmed")
    return { text: "Confirmée", tone: "bg-[#e6efe4] text-[#3e6b4a]" };
  return { text: "À confirmer", tone: "bg-blush text-bronze-dark" };
}

function hhmm(value: string | null): string {
  return value ? value.slice(0, 5) : "";
}

async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error:
          typeof data?.error === "string"
            ? data.error
            : "Une erreur est survenue.",
      };
    }
    return { ok: true, data: data as T };
  } catch {
    return { ok: false, status: 0, error: "Connexion impossible. Vérifiez le réseau." };
  }
}

/* ── Écran de connexion ──────────────────────────────────────────────────── */

function LoginCard({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  /* Le code est long et tapé sur téléphone : pouvoir le relire évite
   *  trois tentatives ratées et le verrou du rate limiting. */
  const [codeVisible, setCodeVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    setError(null);
    const result = await api<{ ok: boolean }>("/api/gestion/login", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    setBusy(false);
    if (result.ok) onSuccess();
    else setError(result.error);
  }

  return (
    <div className="mx-auto max-w-md border border-sand-deep bg-white p-8 sm:p-10">
      <p className="overline-label">Espace privé</p>
      <h1 className="font-display mt-3 text-3xl font-medium">
        Gestion des <em className="text-bronze">rendez-vous</em>
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-taupe">
        Cet espace est réservé à Maison Kanali. Entrez le code d&apos;accès
        pour consulter et organiser les réservations.
      </p>
      <form onSubmit={submit} className="mt-6">
        <label htmlFor="gestion-code" className="field-label">
          Code d&apos;accès
        </label>
        <div className="relative mt-2">
          <input
            id="gestion-code"
            type={codeVisible ? "text" : "password"}
            autoComplete="current-password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="w-full border border-sand-deep bg-ivory py-3 pr-12 pl-4 text-sm outline-none focus:border-bronze"
          />
          <button
            type="button"
            onClick={() => setCodeVisible((visible) => !visible)}
            aria-label={codeVisible ? "Masquer le code" : "Afficher le code"}
            aria-pressed={codeVisible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-taupe transition-colors duration-200 hover:text-espresso"
          >
            {codeVisible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-[#b3543f]">{error}</p>}
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="btn btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Vérification…" : "Entrer"}
        </button>
      </form>
    </div>
  );
}

/* ── Déplacement d'une réservation ───────────────────────────────────────── */

function ReschedulePanel({
  booking,
  onDone,
  onCancel,
}: {
  booking: BookingRow;
  onDone: (message: string) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    let alive = true;
    setSlots(null);
    setTime(null);
    setSlotsError(null);
    api<{ closed: boolean; slots: Slot[] }>(
      `/api/availability?date=${date}&serviceId=${encodeURIComponent(booking.service_id)}`,
    ).then((result) => {
      if (!alive) return;
      if (!result.ok) setSlotsError(result.error);
      else setSlots(result.data.closed ? [] : result.data.slots);
    });
    return () => {
      alive = false;
    };
  }, [date, booking.service_id]);

  async function submit() {
    if (!date || !time || busy) return;
    setBusy(true);
    setError(null);
    const result = await api<{ ok: boolean; emailSent: boolean }>(
      "/api/gestion/bookings/reschedule",
      {
        method: "POST",
        body: JSON.stringify({ id: booking.id, date, time }),
      },
    );
    setBusy(false);
    if (result.ok) {
      onDone(
        result.data.emailSent
          ? `Réservation déplacée. ${booking.first_name} a reçu son nouveau ticket par email.`
          : `Réservation déplacée. ⚠️ L'email n'est pas parti — pensez à prévenir ${booking.first_name}.`,
      );
    } else {
      setError(result.error);
    }
  }

  const free = slots?.filter((slot) => slot.available) ?? [];

  return (
    <div className="mt-4 border-t border-sand-deep pt-4">
      <p className="field-label">Choisir la nouvelle date</p>
      <div className="mt-2">
        <Calendar selected={date} onSelect={setDate} />
      </div>
      {date && (
        <div className="mt-4">
          <p className="field-label">
            Créneaux libres du {formatDateFr(date)}
          </p>
          {slotsError && (
            <p className="mt-2 text-sm text-[#b3543f]">{slotsError}</p>
          )}
          {!slots && !slotsError && (
            <p className="mt-2 text-sm text-taupe">Chargement…</p>
          )}
          {slots && free.length === 0 && (
            <p className="mt-2 text-sm text-taupe">
              Aucun créneau libre ce jour-là.
            </p>
          )}
          {slots && free.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {free.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setTime(slot.time)}
                  className={cn(
                    "h-10 border text-sm transition-colors",
                    time === slot.time
                      ? "border-bronze bg-bronze text-white"
                      : "border-sand-deep bg-white hover:border-bronze",
                  )}
                >
                  {formatTimeFr(slot.time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-[#b3543f]">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!date || !time || busy}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy
            ? "Déplacement…"
            : time && date
              ? `Déplacer au ${formatTimeFr(time)}`
              : "Déplacer"}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-outline">
          Retour
        </button>
      </div>
    </div>
  );
}

/* ── Carte d'une réservation ─────────────────────────────────────────────── */

function BookingCard({
  booking,
  onChanged,
  notify,
}: {
  booking: BookingRow;
  onChanged: () => void;
  notify: (message: string) => void;
}) {
  const [mode, setMode] = useState<"none" | "confirm-cancel" | "reschedule">(
    "none",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = statusLabel(booking);
  const depositPaid = Boolean(booking.paid_at) && booking.deposit_cents > 0;
  const actionable =
    (booking.status === "pending" || booking.status === "confirmed") &&
    !booking.expired;

  async function cancelBooking() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await api<{ ok: boolean; emailSent: boolean }>(
      "/api/gestion/bookings/cancel",
      { method: "POST", body: JSON.stringify({ id: booking.id }) },
    );
    setBusy(false);
    if (result.ok) {
      notify(
        result.data.emailSent
          ? `Réservation annulée. ${booking.first_name} a été prévenue par email.`
          : `Réservation annulée. ⚠️ L'email n'est pas parti — pensez à prévenir ${booking.first_name}.`,
      );
      onChanged();
    } else {
      setError(result.error);
    }
  }

  return (
    <article className="border border-sand-deep bg-white">
      {/* Colonne horaire à gauche : c'est l'information qu'on cherche en
          premier quand on parcourt une journée. */}
      <div className="flex items-stretch">
        {/* Largeur confortable volontairement : à w-20 il ne restait que ~8 px
            de marge autour de l'heure sur un écran de 375 px — trop juste pour
            un rendu de police légèrement différent. */}
        <div className="flex w-[5.5rem] shrink-0 flex-col justify-center border-r border-sand-deep bg-sand/50 px-2 py-4 text-center">
          <p className="font-display text-espresso text-2xl leading-none font-medium">
            {formatTimeFr(hhmm(booking.start_time))}
          </p>
          <p className="text-taupe mt-1.5 text-[0.7rem] leading-tight">
            → {formatTimeFr(hhmm(booking.end_time))}
          </p>
          <p className="text-taupe mt-0.5 text-[0.7rem] leading-tight">
            {formatDuration(booking.duration_min)}
          </p>
        </div>

        <div className="min-w-0 flex-1 px-4 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
            <p className="text-espresso text-[1.0625rem] leading-snug font-semibold">
              {booking.first_name} {booking.last_name}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "px-2 py-0.5 text-[0.65rem] tracking-[0.12em] uppercase",
                  status.tone,
                )}
              >
                {status.text}
              </span>
              {depositPaid && (
                <span className="bg-[#eef3ee] px-2 py-0.5 text-[0.65rem] tracking-[0.12em] text-[#3e6b4a] uppercase">
                  Acompte réglé
                </span>
              )}
            </div>
          </div>

          <p className="text-espresso mt-1.5 text-sm font-medium">
            {booking.service_name}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.7rem]">
            <span
              className={cn(
                "px-2 py-0.5 tracking-[0.1em] uppercase",
                BRAND_TONE[booking.brand],
              )}
            >
              {BRAND_LABEL[booking.brand]}
            </span>
            <span className="text-espresso font-medium">
              {booking.price_label}
            </span>
            <span className="text-taupe">· {booking.reference}</span>
          </div>
        </div>
      </div>

      <div className="border-sand border-t px-4 py-3 text-sm leading-relaxed">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={`tel:${booking.phone.replace(/[^+\d]/g, "")}`}
            className="text-bronze-dark font-medium"
          >
            {booking.phone}
          </a>
          <span className="text-sand-deep">·</span>
          <a
            href={`mailto:${booking.email}`}
            className="text-bronze-dark break-all"
          >
            {booking.email}
          </a>
        </p>
        {booking.notes && (
          <p className="border-bronze/40 text-espresso/80 mt-2 border-l-2 pl-3 italic">
            {booking.notes}
          </p>
        )}
      </div>

      {actionable && mode === "none" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMode("reschedule")}
            className="btn btn-outline"
          >
            Déplacer
          </button>
          <button
            type="button"
            onClick={() => setMode("confirm-cancel")}
            className="btn btn-outline !border-[#c98f80] !text-[#a34a37]"
          >
            Annuler
          </button>
        </div>
      )}

      {mode === "confirm-cancel" && (
        <div className="mt-4 border border-[#e5c5bb] bg-[#fbf3f0] p-4 text-sm">
          <p>
            Annuler la réservation de{" "}
            <strong className="font-medium">
              {booking.first_name} {booking.last_name}
            </strong>{" "}
            le {formatDateFr(booking.booking_date)} à{" "}
            {formatTimeFr(hhmm(booking.start_time))} ? Le créneau sera libéré et
            la cliente prévenue par email.
            {depositPaid &&
              " L'acompte a été réglé en ligne : pensez à la question du remboursement."}
          </p>
          {error && <p className="mt-2 text-[#b3543f]">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={cancelBooking}
              disabled={busy}
              className="btn btn-primary !bg-[#a34a37] disabled:opacity-50"
            >
              {busy ? "Annulation…" : "Oui, annuler"}
            </button>
            <button
              type="button"
              onClick={() => setMode("none")}
              className="btn btn-outline"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {mode === "reschedule" && (
        <ReschedulePanel
          booking={booking}
          onCancel={() => setMode("none")}
          onDone={(message) => {
            notify(message);
            setMode("none");
            onChanged();
          }}
        />
      )}
    </article>
  );
}

/* ── Onglet Indisponibilités ─────────────────────────────────────────────── */

function timeOptions(from: number, to: number): string[] {
  const options: string[] = [];
  for (let m = from; m <= to; m += OPENING.slotStepMinutes) {
    options.push(minutesToTime(m));
  }
  return options;
}

function BlockedTab({ notify }: { notify: (message: string) => void }) {
  const [blocked, setBlocked] = useState<BlockedRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [day, setDay] = useState("");
  const [wholeDay, setWholeDay] = useState(true);
  const [startTime, setStartTime] = useState(minutesToTime(OPENING.openMinutes));
  const [endTime, setEndTime] = useState(minutesToTime(OPENING.closeMinutes));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await api<{ blocked: BlockedRow[] }>("/api/gestion/blocked");
    if (result.ok) {
      setBlocked(result.data.blocked);
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!day || busy) return;
    setBusy(true);
    setFormError(null);
    const result = await api<{ blocked: BlockedRow; conflictCount: number }>(
      "/api/gestion/blocked",
      {
        method: "POST",
        body: JSON.stringify({
          day,
          ...(wholeDay ? {} : { startTime, endTime }),
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        }),
      },
    );
    setBusy(false);
    if (result.ok) {
      setDay("");
      setReason("");
      notify(
        result.data.conflictCount > 0
          ? `Indisponibilité enregistrée. ⚠️ ${result.data.conflictCount} réservation(s) déjà posée(s) sur cette plage : annulez-les ou déplacez-les depuis l'onglet Rendez-vous.`
          : "Indisponibilité enregistrée : ces créneaux n'apparaissent plus sur le site.",
      );
      load();
    } else {
      setFormError(result.error);
    }
  }

  async function remove(id: string) {
    const result = await api<{ ok: boolean }>("/api/gestion/blocked", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    if (result.ok) {
      notify("Indisponibilité retirée : les créneaux sont de nouveau réservables.");
      load();
    } else {
      notify(`⚠️ ${result.error}`);
    }
  }

  return (
    <div>
      <form onSubmit={add} className="border border-sand-deep bg-white p-5">
        <p className="field-label">Bloquer une indisponibilité</p>
        <p className="mt-1 text-sm leading-relaxed text-taupe">
          Congés, absence, empêchement : les créneaux bloqués disparaissent
          immédiatement du site.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="block-day" className="field-label">
              Jour
            </label>
            <input
              id="block-day"
              type="date"
              value={day}
              onChange={(event) => setDay(event.target.value)}
              className="mt-2 w-full border border-sand-deep bg-ivory px-3 py-2.5 text-sm outline-none focus:border-bronze"
            />
          </div>
          <div>
            <span className="field-label">Étendue</span>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setWholeDay(true)}
                className={cn(
                  "flex-1 border px-3 py-2.5 text-sm",
                  wholeDay
                    ? "border-bronze bg-bronze text-white"
                    : "border-sand-deep bg-white",
                )}
              >
                Jour entier
              </button>
              <button
                type="button"
                onClick={() => setWholeDay(false)}
                className={cn(
                  "flex-1 border px-3 py-2.5 text-sm",
                  !wholeDay
                    ? "border-bronze bg-bronze text-white"
                    : "border-sand-deep bg-white",
                )}
              >
                Quelques heures
              </button>
            </div>
          </div>
        </div>
        {!wholeDay && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="block-start" className="field-label">
                De
              </label>
              <select
                id="block-start"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="mt-2 w-full border border-sand-deep bg-ivory px-3 py-2.5 text-sm outline-none focus:border-bronze"
              >
                {timeOptions(
                  OPENING.openMinutes,
                  OPENING.closeMinutes - OPENING.slotStepMinutes,
                ).map((value) => (
                  <option key={value} value={value}>
                    {formatTimeFr(value)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="block-end" className="field-label">
                À
              </label>
              <select
                id="block-end"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="mt-2 w-full border border-sand-deep bg-ivory px-3 py-2.5 text-sm outline-none focus:border-bronze"
              >
                {timeOptions(
                  OPENING.openMinutes + OPENING.slotStepMinutes,
                  OPENING.closeMinutes,
                ).map((value) => (
                  <option key={value} value={value}>
                    {formatTimeFr(value)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="mt-4">
          <label htmlFor="block-reason" className="field-label">
            Note (facultative, visible de vous seules)
          </label>
          <input
            id="block-reason"
            type="text"
            maxLength={120}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Congés, salon, formation…"
            className="mt-2 w-full border border-sand-deep bg-ivory px-3 py-2.5 text-sm outline-none focus:border-bronze"
          />
        </div>
        {formError && <p className="mt-3 text-sm text-[#b3543f]">{formError}</p>}
        <button
          type="submit"
          disabled={!day || busy}
          className="btn btn-primary mt-5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Enregistrement…" : "Bloquer ces créneaux"}
        </button>
      </form>

      <div className="mt-6">
        <p className="field-label">Indisponibilités à venir</p>
        {loadError && <p className="mt-2 text-sm text-[#b3543f]">{loadError}</p>}
        {blocked && blocked.length === 0 && (
          <p className="mt-2 text-sm text-taupe">
            Aucune indisponibilité enregistrée.
          </p>
        )}
        <div className="mt-2 space-y-2">
          {(blocked ?? []).map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 border border-sand-deep bg-white px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{formatDateFr(row.day)}</p>
                <p className="text-taupe">
                  {row.start_time
                    ? `${formatTimeFr(hhmm(row.start_time))} – ${formatTimeFr(hhmm(row.end_time))}`
                    : "Jour entier"}
                  {row.reason ? ` · ${row.reason}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(row.id)}
                className="link-line text-sm text-[#a34a37]"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Application ─────────────────────────────────────────────────────────── */

export function GestionApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"bookings" | "blocked">("bookings");
  const [scope, setScope] = useState<"upcoming" | "past">("upcoming");
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState<BookingRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
  }, []);

  const loadBookings = useCallback(
    async (which: "upcoming" | "past") => {
      const result = await api<{ bookings: BookingRow[] }>(
        `/api/gestion/bookings?scope=${which}`,
      );
      if (result.ok) {
        setBookings(result.data.bookings);
        setLoadError(null);
        setAuthed(true);
      } else if (result.status === 401) {
        setAuthed(false);
      } else {
        setAuthed(true);
        setLoadError(result.error);
      }
    },
    [],
  );

  useEffect(() => {
    loadBookings("upcoming");
  }, [loadBookings]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(timer);
  }, [toast]);

  /* Recherche côté navigateur : la liste tient largement en mémoire, inutile
   *  de repasser par le serveur à chaque lettre tapée. Accents et casse sont
   *  neutralisés — on cherche « lea » et on trouve « Léa ». */
  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return bookings ?? [];
    return (bookings ?? []).filter((booking) =>
      normalize(
        [
          booking.first_name,
          booking.last_name,
          booking.reference,
          booking.phone,
          booking.email,
          booking.service_name,
          BRAND_LABEL[booking.brand],
        ].join(" "),
      ).includes(needle),
    );
  }, [bookings, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, BookingRow[]>();
    for (const booking of filtered) {
      const list = map.get(booking.booking_date) ?? [];
      list.push(booking);
      map.set(booking.booking_date, list);
    }
    return [...map.entries()];
  }, [filtered]);

  async function logout() {
    await api("/api/gestion/login", { method: "DELETE" });
    setAuthed(false);
    setBookings(null);
  }

  if (authed === null) {
    return <p className="py-20 text-center text-sm text-taupe">Chargement…</p>;
  }
  if (!authed) {
    return (
      <LoginCard
        onSuccess={() => {
          setAuthed(true);
          loadBookings(scope);
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="overline-label">Espace privé · Maison Kanali</p>
          <h1 className="font-display mt-2 text-3xl font-medium md:text-4xl">
            Gestion des <em className="text-bronze">rendez-vous</em>
          </h1>
        </div>
        <button type="button" onClick={logout} className="link-line text-sm text-taupe">
          Se déconnecter
        </button>
      </div>

      {toast && (
        <div
          role="status"
          className="mt-5 border border-sand-deep bg-blush px-4 py-3 text-sm leading-relaxed"
        >
          {toast}
        </div>
      )}

      <div className="mt-6 flex gap-2 border-b border-sand-deep">
        {(
          [
            ["bookings", "Rendez-vous"],
            ["blocked", "Indisponibilités"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm tracking-wide",
              tab === key
                ? "border-bronze font-medium text-espresso"
                : "border-transparent text-taupe",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "bookings" ? (
        <div className="mt-5">
          <div className="flex gap-2">
            {(
              [
                ["upcoming", "À venir"],
                ["past", "Passés & annulés"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setScope(key);
                  setBookings(null);
                  loadBookings(key);
                }}
                className={cn(
                  "border px-4 py-2 text-sm",
                  scope === key
                    ? "border-bronze bg-bronze text-white"
                    : "border-sand-deep bg-white text-taupe",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative mt-3">
            <span className="text-taupe pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher : nom, téléphone, référence, prestation…"
              aria-label="Rechercher une réservation"
              className="border-sand-deep bg-ivory focus:border-bronze w-full border py-2.5 pr-10 pl-10 text-sm outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="text-taupe hover:text-espresso absolute inset-y-0 right-0 flex w-10 items-center justify-center text-lg transition-colors duration-200"
              >
                ×
              </button>
            )}
          </div>

          {query && bookings && (
            <p className="text-taupe mt-2 text-sm">
              {filtered.length === 0
                ? "Aucun résultat."
                : `${filtered.length} résultat${filtered.length > 1 ? "s" : ""} sur ${bookings.length}.`}
            </p>
          )}

          {loadError && (
            <p className="mt-5 text-sm text-[#b3543f]">{loadError}</p>
          )}
          {!bookings && !loadError && (
            <p className="mt-8 text-center text-sm text-taupe">Chargement…</p>
          )}
          {bookings && bookings.length === 0 && !query && (
            <p className="mt-8 text-center text-sm text-taupe">
              {scope === "upcoming"
                ? "Aucune réservation à venir pour le moment."
                : "Aucune réservation passée ou annulée sur les 4 derniers mois."}
            </p>
          )}

          <div className="mt-5 space-y-7">
            {grouped.map(([date, list]) => (
              <section key={date}>
                <h2 className="border-bronze/30 text-espresso flex items-baseline justify-between gap-3 border-b pb-1.5 text-sm font-medium">
                  <span className="capitalize">{formatDateFr(date)}</span>
                  <span className="text-taupe text-[0.7rem] tracking-[0.12em] uppercase">
                    {list.length} rendez-vous
                  </span>
                </h2>
                <div className="mt-3 space-y-3">
                  {list.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      notify={notify}
                      onChanged={() => loadBookings(scope)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <BlockedTab notify={notify} />
        </div>
      )}
    </div>
  );
}
