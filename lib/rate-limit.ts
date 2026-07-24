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
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** true si la requête passe, false si la limite est atteinte. */
export function rateLimit(
  scope: string,
  id: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  prune(now);
  const key = `${scope}:${id}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
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
