/**
 * Verrouillage d'urgence — le CADENAS À 3 ÉTAGES de Maison Kanali.
 *
 * Idée : si une attaque est détectée, on ne laisse pas l'intrus travailler
 * tranquillement. On resserre progressivement l'accès aux données, jusqu'au
 * verrouillage total, le temps de sécuriser la base et faire tourner les clés.
 *
 *   Étage 1 — VIGILANCE   : on ralentit fortement (rate limit durci).
 *   Étage 2 — VERROU      : plus aucune écriture (aucune nouvelle réservation
 *                           n'entre en base) ; la lecture reste possible.
 *   Étage 3 — CADENAS     : tout est bloqué (lecture ET écriture) ; le temps
 *                           de vider/sauvegarder la base et repartir sain.
 *
 * Deux sources décident du niveau, on garde toujours la plus stricte :
 *   · MANUELLE   : la variable d'environnement SECURITY_LOCKDOWN (0..3).
 *                  C'est TON interrupteur : tu la mets à 3 sur Vercel et,
 *                  au prochain instant, la base est cadenassée partout.
 *   · AUTOMATIQUE: un compteur de menaces en mémoire. Si trop de tentatives
 *                  arrivent coup sur coup, le niveau monte tout seul, puis
 *                  redescend après une accalmie.
 */

export type LockLevel = 0 | 1 | 2 | 3;

export const LOCK_LABELS: Record<LockLevel, string> = {
  0: "normal",
  1: "vigilance",
  2: "verrou-écritures",
  3: "cadenas-total",
};

/* ── Escalade automatique (en mémoire, par instance) ─────────────────────── */

interface ThreatWindow {
  count: number;
  windowStart: number;
  level: LockLevel;
  lastThreat: number;
}

const state: ThreatWindow = {
  count: 0,
  windowStart: 0,
  level: 0,
  lastThreat: 0,
};

const WINDOW_MS = 5 * 60_000; // fenêtre d'observation : 5 minutes
const ESCALATE_TO_1 = 5; // 5 menaces → vigilance
const ESCALATE_TO_2 = 15; // 15 menaces → verrou écritures
const ESCALATE_TO_3 = 40; // 40 menaces → cadenas total
const COOLDOWN_MS = 15 * 60_000; // 15 min sans menace → on redescend

/** À appeler à chaque tentative détectée. Fait monter le niveau si besoin. */
export function recordThreat(now = Date.now()): LockLevel {
  if (now - state.windowStart > WINDOW_MS) {
    state.windowStart = now;
    state.count = 0;
  }
  state.count += 1;
  state.lastThreat = now;

  let auto: LockLevel = 0;
  if (state.count >= ESCALATE_TO_3) auto = 3;
  else if (state.count >= ESCALATE_TO_2) auto = 2;
  else if (state.count >= ESCALATE_TO_1) auto = 1;

  // Le niveau automatique ne redescend pas en pleine rafale.
  if (auto > state.level) state.level = auto;
  return state.level;
}

/** Niveau automatique courant (avec retour au calme après accalmie). */
function autoLevel(now = Date.now()): LockLevel {
  if (state.level > 0 && now - state.lastThreat > COOLDOWN_MS) {
    state.level = 0;
    state.count = 0;
  }
  return state.level;
}

/** Niveau fixé manuellement via l'environnement (ton interrupteur). */
function manualLevel(): LockLevel {
  const raw = Number.parseInt(process.env.SECURITY_LOCKDOWN ?? "0", 10);
  if (raw >= 3) return 3;
  if (raw === 2) return 2;
  if (raw === 1) return 1;
  return 0;
}

/** Niveau EFFECTIF = le plus strict entre manuel et automatique. */
export function lockLevel(now = Date.now()): LockLevel {
  return Math.max(manualLevel(), autoLevel(now)) as LockLevel;
}

/** Les écritures (nouvelles réservations/demandes) sont-elles bloquées ? */
export function writesBlocked(): boolean {
  return lockLevel() >= 2;
}

/** Tout accès aux données est-il cadenassé ? */
export function allBlocked(): boolean {
  return lockLevel() >= 3;
}

/** Facteur de durcissement du rate limit selon l'étage (1 = normal). */
export function throttleFactor(): number {
  const level = lockLevel();
  if (level >= 3) return 100; // quasi tout refusé
  if (level === 2) return 8;
  if (level === 1) return 3;
  return 1;
}

/** Message renvoyé quand la base est protégée. */
export const LOCKDOWN_MESSAGE =
  "La réservation en ligne est momentanément suspendue pour maintenance. " +
  "Merci de réessayer plus tard ou de nous contacter directement.";
