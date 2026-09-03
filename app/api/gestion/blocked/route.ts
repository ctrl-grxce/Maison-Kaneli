import { NextResponse } from "next/server";
import { z } from "zod";
import { OPENING } from "@/lib/config";
import { guardGestion, adminClientOr503 } from "@/lib/gestion-api";
import {
  isValidIsoDate,
  isOpenDay,
  parisNow,
  timeToMinutes,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

/**
 * Indisponibilités de la maison (congés, absences) — /api/gestion/blocked.
 * Un blocage retire immédiatement les créneaux du site public.
 */

/** GET — les blocages à venir (aujourd'hui inclus). */
export async function GET(request: Request) {
  const denied = guardGestion(request);
  if (denied) return denied;
  const { supabase, response } = adminClientOr503();
  if (!supabase) return response;

  const { data, error } = await supabase
    .from("blocked_slots")
    .select("id, day, start_time, end_time, reason, created_at")
    .gte("day", parisNow().date)
    .order("day", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });
  if (error) {
    console.error("[gestion] Liste des indisponibilités:", error);
    return NextResponse.json(
      { error: "Impossible de charger les indisponibilités." },
      { status: 500 },
    );
  }
  return NextResponse.json({ blocked: data ?? [] });
}

const timeString = z.string().regex(/^\d{2}:\d{2}$/);
const createSchema = z
  .object({
    day: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: timeString.optional(),
    endTime: timeString.optional(),
    reason: z.string().trim().max(120).optional(),
  })
  .refine((value) => (value.startTime === undefined) === (value.endTime === undefined), {
    message: "Heures incomplètes",
  });

/** POST — bloque un jour entier ou une plage d'heures. */
export async function POST(request: Request) {
  const denied = guardGestion(request);
  if (denied) return denied;
  const { supabase, response } = adminClientOr503();
  if (!supabase) return response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const { day, startTime, endTime, reason } = parsed.data;

  if (!isValidIsoDate(day) || day < parisNow().date) {
    return NextResponse.json(
      { error: "La date doit être aujourd'hui ou à venir." },
      { status: 400 },
    );
  }
  if (!isOpenDay(day)) {
    return NextResponse.json(
      { error: "Ce jour est déjà fermé (dimanche)." },
      { status: 400 },
    );
  }
  if (startTime !== undefined && endTime !== undefined) {
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (
      startMin >= endMin ||
      startMin < OPENING.openMinutes ||
      endMin > OPENING.closeMinutes
    ) {
      return NextResponse.json(
        { error: "La plage d'heures est invalide (entre l'ouverture et la fermeture)." },
        { status: 400 },
      );
    }
  }

  const { data, error } = await supabase
    .from("blocked_slots")
    .insert({
      day,
      start_time: startTime ?? null,
      end_time: endTime ?? null,
      reason: reason || null,
    })
    .select("id, day, start_time, end_time, reason, created_at");
  if (error) {
    console.error("[gestion] Création d'indisponibilité:", error);
    return NextResponse.json(
      { error: "L'enregistrement a échoué. Merci de réessayer." },
      { status: 500 },
    );
  }

  /* Réservations déjà posées sur la plage : signalées à l'écran pour que
     les filles les annulent ou les déplacent — le blocage n'y touche pas. */
  const { data: conflicts } = await supabase
    .from("bookings")
    .select("id")
    .eq("booking_date", day)
    .in("status", ["pending", "confirmed"])
    .lt("start_time", endTime ?? "23:59")
    .gt("end_time", startTime ?? "00:00");

  return NextResponse.json(
    { blocked: data?.[0] ?? null, conflictCount: conflicts?.length ?? 0 },
    { status: 201 },
  );
}

const deleteSchema = z.object({ id: z.string().uuid() });

/** DELETE — retire un blocage (les créneaux réapparaissent sur le site). */
export async function DELETE(request: Request) {
  const denied = guardGestion(request);
  if (denied) return denied;
  const { supabase, response } = adminClientOr503();
  if (!supabase) return response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
  const parsed = deleteSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { error } = await supabase
    .from("blocked_slots")
    .delete()
    .eq("id", parsed.data.id);
  if (error) {
    console.error("[gestion] Suppression d'indisponibilité:", error);
    return NextResponse.json(
      { error: "La suppression a échoué. Merci de réessayer." },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
