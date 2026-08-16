import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";
import { parisNow } from "@/lib/availability";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — battement de cœur du site.
 *
 * Appelé chaque jour par le cron Vercel (vercel.json) : la petite requête
 * vers Supabase compte comme de l'activité et empêche le plan gratuit de
 * mettre le projet en pause — sans quoi les réservations tomberaient en
 * panne silencieusement après une semaine sans visite.
 */
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, database: "non configurée" },
      { status: 503 },
    );
  }

  const { error } = await supabase.rpc("get_taken_slots", {
    p_date: parisNow().date,
  });

  if (error) {
    console.error("[health] Supabase injoignable:", error.message);
    return NextResponse.json(
      { ok: false, database: "injoignable" },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true, database: "active" });
}
