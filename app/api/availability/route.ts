import { NextResponse } from "next/server";
import { getService } from "@/lib/services";
import { getSupabase } from "@/lib/supabase-server";
import { clientIp, rateLimit, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { allBlocked, throttleFactor, LOCKDOWN_MESSAGE } from "@/lib/lockdown";
import {
  buildSlots,
  isBookableDate,
  isValidIsoDate,
  timeToMinutes,
  type TakenRange,
} from "@/lib/availability";

export const dynamic = "force-dynamic";

/** GET /api/availability?date=YYYY-MM-DD&serviceId=… */
export async function GET(request: Request) {
  // Étage 3 (cadenas total) : plus aucune lecture des données.
  if (allBlocked()) {
    return NextResponse.json({ error: LOCKDOWN_MESSAGE }, { status: 503 });
  }
  // Le rate limit se durcit automatiquement quand la vigilance monte.
  if (
    !rateLimit("availability", clientIp(request), Math.ceil(60 / throttleFactor()), 60_000)
  ) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? "";
  const serviceId = searchParams.get("serviceId") ?? "";

  const service = getService(serviceId);
  if (!service || !isValidIsoDate(date)) {
    return NextResponse.json(
      { error: "Paramètres invalides." },
      { status: 400 },
    );
  }

  if (!isBookableDate(date)) {
    return NextResponse.json({ date, closed: true, slots: [] });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "La réservation en ligne est momentanément indisponible." },
      { status: 503 },
    );
  }

  /* Occupation du PÔLE de la prestation : Kandy et Nafi reçoivent chacune
     une cliente en parallèle, une réservation chez l'une ne doit pas fermer
     le créneau chez l'autre (migration 2026-09-18_calendriers_par_pole).

     Repli volontaire sur la version à un argument : si le site est déployé
     avant que la migration ne soit appliquée, la réservation continue de
     fonctionner — en calendrier partagé, comme avant. Mieux vaut des
     créneaux trop prudents qu'une page de réservation en panne. */
  let { data, error } = await supabase.rpc("get_taken_slots", {
    p_date: date,
    p_brand: service.brand,
  });

  if (error) {
    console.warn(
      "[availability] get_taken_slots par pôle indisponible, repli sur le calendrier partagé :",
      error.message,
    );
    ({ data, error } = await supabase.rpc("get_taken_slots", { p_date: date }));
  }

  if (error) {
    console.error("[availability] RPC get_taken_slots:", error);
    return NextResponse.json(
      { error: "La réservation en ligne est momentanément indisponible." },
      { status: 503 },
    );
  }

  const taken: TakenRange[] = (data ?? []).map(
    (row: { start_time: string; end_time: string }) => ({
      startMin: timeToMinutes(row.start_time.slice(0, 5)),
      endMin: timeToMinutes(row.end_time.slice(0, 5)),
    }),
  );

  return NextResponse.json({
    date,
    closed: false,
    slots: buildSlots(date, service.durationMin, taken),
  });
}
