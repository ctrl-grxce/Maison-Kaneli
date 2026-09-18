import { createHmac, createHash, timingSafeEqual } from "crypto";

/**
 * Accès à l'espace de gestion (/gestion) — réservé à Kandy & Nafi.
 *
 * Principe : un code secret unique (variable d'environnement ADMIN_CODE,
 * jamais dans le code source). Quand le code tapé est bon, le serveur pose
 * un cookie signé HMAC valable 7 jours ; chaque route d'administration
 * vérifie ce cookie. Changer ADMIN_CODE sur Vercel déconnecte tout le monde
 * immédiatement (la clé de signature en dérive).
 */

export const GESTION_COOKIE = "mk_gestion";
const SESSION_DAYS = 7;

/** Nettoie une variable d'environnement : BOM invisible, espaces, retours. */
function cleanEnv(value: string | undefined): string | undefined {
  const cleaned = value?.replace(/^﻿/, "").trim();
  return cleaned || undefined;
}

export function adminCode(): string | null {
  return cleanEnv(process.env.ADMIN_CODE) ?? null;
}

/** Clé de signature dérivée du code — change le code, tout est invalidé. */
function signingKey(code: string): Buffer {
  return createHash("sha256").update(`maison-kanali/gestion|${code}`).digest();
}

function sign(payload: string, code: string): string {
  return createHmac("sha256", signingKey(code)).update(payload).digest("hex");
}

/**
 * Comparaison en temps constant (évite les attaques par chronométrage).
 * On compare les empreintes plutôt que les chaînes : elles font toujours la
 * même taille, donc le chronomètre ne trahit plus non plus la LONGUEUR du
 * code secret — premier renseignement utile à qui veut le deviner.
 */
export function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}

/** true si le code soumis est le bon. */
export function verifyCode(submitted: string): boolean {
  const expected = adminCode();
  if (!expected) return false;
  return safeEqual(submitted.trim(), expected);
}

/** Valeur du cookie de session : « expiration.signature ». */
export function createSessionValue(now = Date.now()): string | null {
  const code = adminCode();
  if (!code) return null;
  const expires = now + SESSION_DAYS * 24 * 60 * 60_000;
  return `${expires}.${sign(String(expires), code)}`;
}

/** true si la valeur du cookie est authentique et non expirée. */
export function verifySessionValue(
  value: string | undefined,
  now = Date.now(),
): boolean {
  const code = adminCode();
  if (!code || !value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const expires = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  if (!/^\d{10,16}$/.test(expires)) return false;
  if (Number(expires) <= now) return false;
  return safeEqual(signature, sign(expires, code));
}

/** Durée de vie du cookie, en secondes (pour l'en-tête Set-Cookie). */
export const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60;

/**
 * Attributs du cookie, au même endroit pour la pose et pour l'effacement.
 * `strict` est tenable ici : l'écran de gestion charge tout en JavaScript
 * depuis le site lui-même, donc aucune requête légitime ne vient d'ailleurs —
 * et un site tiers ne peut plus déclencher d'annulation au nom des filles.
 */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
} as const;

/** Extrait la valeur du cookie de gestion d'une requête. */
export function sessionFromRequest(request: Request): string | undefined {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === GESTION_COOKIE) return rest.join("=");
  }
  return undefined;
}

/** true si la requête porte une session de gestion valide. */
export function isAuthorized(request: Request): boolean {
  return verifySessionValue(sessionFromRequest(request));
}
