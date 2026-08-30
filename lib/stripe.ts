import Stripe from "stripe";
import { SITE } from "./config";

/**
 * Connexion Stripe — paiement des acomptes (docs/PAIEMENT.md).
 *
 * Tout est derrière l'interrupteur PAYMENTS_ENABLED : éteint, le site se
 * comporte exactement comme avant, même avec ce code déployé.
 *
 * Sécurité : la clé secrète ne vit QUE dans les variables d'environnement
 * (STRIPE_SECRET_KEY, collée par Gradi lui-même — jamais dans le code).
 * Le numéro de carte ne touche jamais notre serveur : la cliente paie sur
 * la page hébergée de Stripe (Checkout).
 */

/** Nettoie une variable d'environnement : BOM invisible, espaces, retours. */
function cleanEnv(value: string | undefined): string | undefined {
  const cleaned = value?.replace(/^\uFEFF/, "").trim();
  return cleaned || undefined;
}

/** L'interrupteur : paiements actifs seulement si la variable est à 1/true
 *  ET que la clé Stripe est bien là (sinon on retombe sur le circuit actuel). */
export function paymentsEnabled(): boolean {
  const flag = cleanEnv(process.env.PAYMENTS_ENABLED)?.toLowerCase();
  const enabled = flag === "1" || flag === "true";
  if (!enabled) return false;
  if (!cleanEnv(process.env.STRIPE_SECRET_KEY)) {
    console.warn(
      "[stripe] PAYMENTS_ENABLED est allumé mais STRIPE_SECRET_KEY manque — paiements désactivés.",
    );
    return false;
  }
  return true;
}

/** Secret de signature du webhook (whsec_…) — fourni par Stripe. */
export function getWebhookSecret(): string | undefined {
  return cleanEnv(process.env.STRIPE_WEBHOOK_SECRET);
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = cleanEnv(process.env.STRIPE_SECRET_KEY);
  if (!key) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

/** Durées du blocage de créneau (docs/PAIEMENT.md).
 *  La session Stripe expire AVANT le blocage en base : impossible de payer un
 *  créneau que la base aurait déjà rendu — jamais de double réservation. */
export const CHECKOUT_EXPIRES_MINUTES = 31;
export const HOLD_EXPIRES_MINUTES = 35;

export interface DepositCheckoutArgs {
  bookingId: string;
  reference: string;
  serviceName: string;
  brandLabel: string;
  depositCents: number;
  customerEmail: string;
  /** Origine absolue du site pour les retours (ex. https://maisonkanali.fr). */
  origin: string;
  /** Paramètres à réafficher sur la page de confirmation. */
  date: string;
  time: string;
}

/** Crée la session de paiement hébergée et renvoie son URL. */
export async function createDepositCheckoutSession(
  args: DepositCheckoutArgs,
): Promise<{ id: string; url: string }> {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY manquante");

  const successParams = new URLSearchParams({
    type: "p",
    ref: args.reference,
    s: args.serviceName,
    d: args.date,
    t: args.time,
    paid: "1",
    bid: args.bookingId,
  });
  const cancelParams = new URLSearchParams({ bid: args.bookingId });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    customer_email: args.customerEmail,
    client_reference_id: args.bookingId,
    metadata: { booking_id: args.bookingId, reference: args.reference },
    expires_at:
      Math.floor(Date.now() / 1000) + CHECKOUT_EXPIRES_MINUTES * 60,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: args.depositCents,
          product_data: {
            name: `Acompte — ${args.serviceName}`,
            description: `${args.brandLabel} · réservation ${args.reference} — le reste se règle sur place.`,
          },
        },
      },
    ],
    payment_intent_data: {
      description: `Acompte réservation ${args.reference} — Maison Kanali`,
    },
    success_url: `${args.origin}/rendez-vous/confirmation?${successParams.toString()}`,
    cancel_url: `${args.origin}/rendez-vous/annule?${cancelParams.toString()}`,
  });

  if (!session.url) throw new Error("Session Checkout créée sans URL");
  return { id: session.id, url: session.url };
}

/** Origine à utiliser pour les URLs de retour : celle de la requête si elle
 *  est connue (fonctionne aussi sur les déploiements de prévisualisation),
 *  sinon l'adresse officielle du site. */
export function requestOrigin(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  try {
    return new URL(request.url).origin;
  } catch {
    return SITE.url;
  }
}
