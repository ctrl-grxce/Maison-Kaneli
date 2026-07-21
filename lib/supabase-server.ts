import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Valeurs par défaut du projet « maison-kanali » (eu-west-3).
 * La clé « publishable » est publique par conception (sécurité assurée par
 * RLS + RPC côté base). Les variables d'environnement restent prioritaires.
 */
const DEFAULT_URL = "https://aatzhqzntpzubkvnriop.supabase.co";
const DEFAULT_KEY = "sb_publishable_aEIpk1yDOxqWG3bS5GK42A_jcVOroNR";

/**
 * Client Supabase côté serveur (routes API uniquement).
 * La base n'est jamais interrogée depuis le navigateur : toutes les
 * opérations passent par des fonctions RPC `security definer`.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? DEFAULT_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? DEFAULT_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
