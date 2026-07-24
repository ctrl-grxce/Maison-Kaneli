import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté serveur (routes API uniquement).
 *
 * Sécurité :
 *   · Les identifiants ne vivent QUE dans les variables d'environnement —
 *     jamais dans le code source, jamais dans le bundle envoyé au navigateur.
 *   · La base n'est jamais interrogée depuis le navigateur : toutes les
 *     opérations passent par des fonctions RPC `security definer`, et les
 *     tables sont verrouillées par RLS sans aucune policy publique.
 */
export function getSupabase(): SupabaseClient | null {
  // Noms serveur d'abord ; anciens noms NEXT_PUBLIC_* acceptés en secours
  // le temps de la migration des variables sur Vercel.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
