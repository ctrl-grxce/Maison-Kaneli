/**
 * Couche de tromperie (deception) — les LEURRES de Maison Kanali.
 *
 * Aucune vraie visiteuse ne demande `/admin`, `/.env` ou `/wp-login.php` :
 * seuls un scanner automatique ou une personne mal intentionnée le font.
 * Quand l'un de ces chemins est touché, on répond par un DÉCOR factice
 * crédible (fausse page, faux fichier, fausses données), on ralentit
 * l'intrus dans une impasse — et on journalise / alerte.
 *
 * Ce module est volontairement « pur » (aucune dépendance Node) pour
 * rester exécutable dans le middleware Edge.
 */

export type DecoyKind = "env" | "login" | "export" | "generic";

/** Chemins-pièges. Clé = chemin exact (en minuscules, sans slash final). */
export const HONEYPOT_PATHS: Record<string, DecoyKind> = {
  "/.env": "env",
  "/.env.local": "env",
  "/.env.production": "env",
  "/config.json": "env",
  "/credentials.json": "env",
  "/.git/config": "generic",
  "/backup.zip": "generic",
  "/backup.sql": "generic",
  "/dump.sql": "generic",
  "/wp-login.php": "login",
  "/wp-admin": "login",
  "/administrator": "login",
  "/admin": "login",
  "/admin/login": "login",
  "/dashboard/admin": "login",
  "/phpmyadmin": "login",
  "/api/admin": "export",
  "/api/admin/export": "export",
  "/api/admin/clients": "export",
  "/api/export": "export",
  "/server-status": "generic",
};

/** Motifs d'attaque courants repérés dans l'URL complète. */
export const PROBE_PATTERNS: RegExp[] = [
  /\.\.[/\\]/, // traversée de répertoire
  /\/etc\/passwd/i,
  /\bunion\b.+\bselect\b/i, // injection SQL
  /\bor\b\s+1\s*=\s*1/i,
  /<script\b/i, // sonde XSS
  /\/wp-content\//i,
  /\/wp-includes\//i,
  /\.(php|asp|aspx|jsp|cgi)(\?|$)/i,
];

/** Normalise un chemin pour la comparaison (minuscules, sans slash final). */
export function normalizePath(pathname: string): string {
  const lower = pathname.toLowerCase();
  return lower.length > 1 && lower.endsWith("/") ? lower.slice(0, -1) : lower;
}

/** Décide si une requête est un leurre touché ou une sonde d'attaque. */
export function classifyThreat(
  pathname: string,
  fullUrl: string,
): { hit: true; kind: DecoyKind; reason: string } | { hit: false } {
  const path = normalizePath(pathname);
  const kind = HONEYPOT_PATHS[path];
  if (kind) return { hit: true, kind, reason: `honeypot:${path}` };

  for (const pattern of PROBE_PATTERNS) {
    if (pattern.test(fullUrl)) {
      return { hit: true, kind: "generic", reason: `probe:${pattern.source}` };
    }
  }
  return { hit: false };
}

/* ── Décors factices ──────────────────────────────────────────────────────
 * Objectif : paraître VRAI à un attaquant pour qu'il s'y enlise, tout en
 * étant totalement inoffensif et sans aucune donnée réelle. Les valeurs
 * ressemblant à des clés sont des « honeytokens » — elles ne mènent nulle
 * part et servent uniquement de mouchard si quelqu'un tente de s'en servir.
 */

const FAKE_ENV = `# Maison Kanali — configuration (production)
NODE_ENV=production
APP_URL=https://maison-kanali.internal
DB_HOST=10.0.4.18
DB_NAME=mk_prod
DB_USER=mk_app
DB_PASSWORD=Kx9$mLp2_Qv7Tn4wZ
SUPABASE_URL=https://mk9prod3xz.supabase.co
SUPABASE_SERVICE_KEY=sb_secret_hT4kQ2Rf8Wp1Ld6Yc0Nb5Mx3Vz7Jg9Aq
JWT_SECRET=b91f2c7a4e8d3016fa5c9d20e7b48c1f
ADMIN_TOKEN=mk_adm_5f2Kd9Lp7Qw3Zx8Rt1Yv6Nb0Mc4
RESEND_API_KEY=re_9Hn2Kx7Lp4Qw8Zt3Rf6Yc1Vb5Md0Ng
`;

const FAKE_LOGIN = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Administration — Connexion</title>
<style>body{font-family:system-ui,Arial,sans-serif;background:#111;color:#eee;display:grid;place-items:center;height:100vh;margin:0}form{background:#1c1c1c;padding:2rem;border-radius:8px;width:300px}input{width:100%;padding:.6rem;margin:.4rem 0;box-sizing:border-box;border:1px solid #333;background:#222;color:#eee;border-radius:4px}button{width:100%;padding:.6rem;margin-top:.6rem;background:#a9744f;color:#fff;border:0;border-radius:4px;cursor:pointer}</style>
</head><body>
<form method="post" action="/admin/login">
<h2>Panel d'administration</h2>
<input name="user" placeholder="Identifiant" autocomplete="off">
<input name="pass" type="password" placeholder="Mot de passe" autocomplete="off">
<button type="submit">Se connecter</button>
</form>
</body></html>`;

/** Fausses réservations — honeytokens. Aucune donnée réelle. */
const FAKE_EXPORT = {
  ok: true,
  page: 1,
  total: 5,
  bookings: [
    { id: "MK-A0F21C", client: "Sarah D.", email: "s.dubois83@example.com", phone: "+33 6 •• •• •• 41", service: "Pose complète gel", date: "2026-07-29", status: "confirmed" },
    { id: "MK-B72E90", client: "Aïcha K.", email: "aicha.k@example.com", phone: "+33 7 •• •• •• 08", service: "Volume russe", date: "2026-07-30", status: "pending" },
    { id: "MK-C1D4A7", client: "Léa M.", email: "lea.martin@example.com", phone: "+33 6 •• •• •• 55", service: "Mariée — Jour J", date: "2026-08-02", status: "confirmed" },
    { id: "MK-D9930B", client: "Fatou S.", email: "fatou.sow@example.com", phone: "+33 6 •• •• •• 19", service: "Remplissage", date: "2026-08-03", status: "confirmed" },
    { id: "MK-E5518F", client: "Chloé R.", email: "chloe.r@example.com", phone: "+33 7 •• •• •• 72", service: "Pose mixte", date: "2026-08-05", status: "pending" },
  ],
  // Mouchard : ce jeton n'existe dans aucune vraie base.
  _export_token: "hT-mk-canary-4f2Kd9Lp7Qw3",
};

/** Construit la réponse-décor (contenu + type + statut) pour un leurre. */
export function decoyPayload(kind: DecoyKind): {
  body: string;
  contentType: string;
  status: number;
} {
  switch (kind) {
    case "env":
      return { body: FAKE_ENV, contentType: "text/plain; charset=utf-8", status: 200 };
    case "login":
      return { body: FAKE_LOGIN, contentType: "text/html; charset=utf-8", status: 200 };
    case "export":
      return {
        body: JSON.stringify(FAKE_EXPORT, null, 2),
        contentType: "application/json; charset=utf-8",
        status: 200,
      };
    default:
      return { body: "OK", contentType: "text/plain; charset=utf-8", status: 200 };
  }
}
