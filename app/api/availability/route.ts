import { NextResponse } from "next/server";
import { getService } from "@/lib/services";
import { getSupabase } from "@/lib/supabase-server";
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

  const { data, error } = await supabase.rpc("get_taken_slots", {
    p_date: date,
  });

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
