/**
 * Protection des routes API : limitation de débit et contrôle d'origine.
 *
 * Le limiteur vit en mémoire (par instance serverless) : il ne remplace pas
 * un vrai WAF, mais freine efficacement les scripts abusifs et le spam,
 * sans dépendance externe ni coût.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Purge paresseuse — évite toute croissance sans borne de la Map. */
function prune(now: number): void {
  if (buckets.size < 1000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Adresse IP de la cliente (en-tête posé par Vercel / le proxy). */
export function clientIp(request: Request): string {
  /* `x-forwarded-for` est écrit librement par le client : s'en contenter
     offrirait une adresse neuve à chaque essai, donc un nombre illimité de
     tentatives. On préfère les en-têtes que Vercel pose (et réécrit) lui-même,
     et on ne retombe sur le premier saut qu'en développement local. */
  const trusted =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for");
  return trusted?.split(",")[0]?.trim() || "unknown";
}

/** Incrémente le compteur d'une clé et renvoie son total dans la fenêtre. */
function bump(scope: string, id: string, windowMs: number): number {
  const now = Date.now();
  prune(now);
  const key = `${scope}:${id}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }
  bucket.count += 1;
  return bucket.count;
}

/** true si la requête passe, false si la limite est atteinte. */
export function rateLimit(
  scope: string,
  id: string,
  limit: number,
  windowMs: number,
): boolean {
  return bump(scope, id, windowMs) <= limit;
}

/*
 * Compteurs d'échecs — pour les formulaires à secret (le code de /gestion).
 * Là, seule une tentative RATÉE doit coûter : une saisie juste ne doit jamais
 * rapprocher Kandy & Nafi du verrou, alors qu'une rafale de codes faux doit
 * s'arrêter net.
 */

/** Nombre d'échecs déjà enregistrés, sans faire monter le compteur. */
export function failureCount(scope: string, id: string): number {
  const bucket = buckets.get(`${scope}:${id}`);
  if (!bucket || bucket.resetAt <= Date.now()) return 0;
  return bucket.count;
}

/** Enregistre un échec et renvoie le total dans la fenêtre. */
export function recordFailure(
  scope: string,
  id: string,
  windowMs: number,
): number {
  return bump(scope, id, windowMs);
}

/** Remet le compteur à zéro après une réussite. */
export function clearFailures(scope: string, id: string): void {
  buckets.delete(`${scope}:${id}`);
}

/**
 * Anti-CSRF simple : si un en-tête Origin est présent, son hôte doit être
 * celui du site qui reçoit la requête. Les navigateurs l'envoient toujours
 * pour les POST cross-site — un site tiers ne peut donc pas poster ici.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    const requestHost =
      request.headers.get("x-forwarded-host") ??
      request.headers.get("host") ??
      new URL(request.url).host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

/** Réponse JSON 429 uniforme. */
export const RATE_LIMIT_MESSAGE =
  "Trop de demandes en peu de temps. Merci de patienter un instant avant de réessayer.";
