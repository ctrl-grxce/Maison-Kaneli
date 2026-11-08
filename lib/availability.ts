import { OPENING } from "./config";

/** Plage horaire occupée, en minutes depuis minuit. */
export interface TakenRange {
  startMin: number;
  endMin: number;
}

export interface Slot {
  /** Heure de début « HH:MM ». */
  time: string;
  available: boolean;
  /** Créneau tardif (départ à 18h ou plus) : supplément de 10 €. */
  late?: boolean;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Date et heure courantes à Paris (le serveur peut tourner en UTC). */
export function parisNow(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10),
  };
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y &&
    date.getUTCMonth() === m - 1 &&
    date.getUTCDate() === d
  );
}

/** 0 = dimanche … 6 = samedi (indépendant du fuseau du serveur). */
export function dayOfWeek(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function isOpenDay(isoDate: string): boolean {
  return (OPENING.openDays as readonly number[]).includes(dayOfWeek(isoDate));
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/**
 * Une date est réservable si elle est ouvrée, ni passée, ni au-delà de
 * l'horizon de réservation.
 */
export function isBookableDate(isoDate: string, today = parisNow().date): boolean {
  if (!isValidIsoDate(isoDate) || !isOpenDay(isoDate)) return false;
  if (isoDate < today) return false;
  return isoDate <= addDays(today, OPENING.horizonDays);
}

/** Départ en créneau tardif (18h ou plus) → supplément de 10 €. */
export function isLateStart(startMin: number): boolean {
  return startMin >= OPENING.lateStartMinutes;
}

/** Départs tardifs possibles pour une durée donnée : 18h00, 18h30… tant que
 *  la prestation finit à 20h00 au plus tard. */
function lateStarts(durationMin: number): number[] {
  const starts: number[] = [];
  for (
    let start = OPENING.lateStartMinutes;
    start + durationMin <= OPENING.lateEndMinutes;
    start += OPENING.slotStepMinutes
  ) {
    starts.push(start);
  }
  return starts;
}

/**
 * true si un rendez-vous peut commencer à cette heure. Deux cas :
 *  · journée : sur la grille des 30 min, entre l'ouverture et le dernier
 *    départ (17h00), quelle que soit la durée de la prestation ;
 *  · soirée (créneau tardif) : à partir de 18h00, fin à 20h00 maximum.
 * Même règle pour la réservation et le déplacement.
 */
export function isBookableStart(startMin: number, durationMin: number): boolean {
  if (lateStarts(durationMin).includes(startMin)) return true;
  return (
    startMin >= OPENING.openMinutes &&
    startMin <= OPENING.lastStartMinutes &&
    (startMin - OPENING.openMinutes) % OPENING.slotStepMinutes === 0
  );
}

/**
 * Construit la grille des créneaux d'une journée pour une prestation donnée :
 * départs tous les 30 min jusqu'au dernier départ (17h00) — une prestation
 * longue peut donc finir après la fermeture — puis les créneaux tardifs
 * (18h00 et plus, fin à 20h00 maximum), sans chevaucher aucune réservation
 * existante. Pour aujourd'hui, un délai minimal de préparation est appliqué.
 */
export function buildSlots(
  isoDate: string,
  durationMin: number,
  taken: TakenRange[],
  now = parisNow(),
): Slot[] {
  const starts: number[] = [];
  for (
    let start = OPENING.openMinutes;
    start <= OPENING.lastStartMinutes;
    start += OPENING.slotStepMinutes
  ) {
    starts.push(start);
  }
  starts.push(...lateStarts(durationMin));

  return starts.map((start) => {
    const end = start + durationMin;
    const overlaps = taken.some((r) => start < r.endMin && end > r.startMin);
    const tooSoon =
      isoDate === now.date && start < now.minutes + OPENING.minLeadMinutes;
    const slot: Slot = {
      time: minutesToTime(start),
      available: !overlaps && !tooSoon,
    };
    if (isLateStart(start)) slot.late = true;
    return slot;
  });
}
