import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/*
 * Politique de sécurité du contenu (CSP) : tout provient du site lui-même.
 * `unsafe-inline` est requis par les scripts/styles inline de Next.js ;
 * `unsafe-eval` n'est ajouté qu'en développement (rechargement à chaud).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Le site ne peut jamais être affiché dans une iframe (anti-clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Interdit au navigateur de « deviner » un type de contenu.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // N'envoie que l'origine aux sites tiers, jamais l'URL complète.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Aucune API sensible du navigateur n'est utilisée par le site.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // HTTPS obligatoire pendant 2 ans, sous-domaines compris.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
