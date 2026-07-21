/** Concatène des classes conditionnelles. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** "2026-07-25" → "samedi 25 juillet 2026" */
export function formatDateFr(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

/** "10:30" → "10h30" */
export function formatTimeFr(time: string): string {
  const [h, min] = time.split(":");
  return `${parseInt(h, 10)}h${min}`;
}

/** 90 → "1 h 30" ; 60 → "1 h" ; 45 → "45 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${String(m).padStart(2, "0")}`;
}
