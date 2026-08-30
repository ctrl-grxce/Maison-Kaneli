# 💳 Paiement des acomptes en ligne — document de conception

*Rédigé le 30/08/2026, validé par Gradi (architecture le 30/08, montants et
règles emails le 29-30/08). C'est LA référence du chantier paiement — toute
modification de périmètre se note ici.*

## Décisions actées

| Sujet | Décision |
|---|---|
| Prestataire | **Stripe**, page de paiement hébergée (Checkout) + webhook signé |
| Montants d'acompte | **Ongles 20 €** · **Maquillage 30 €** · **Poses de cils 20 €** · **Dépose 0 €** (paiement intégral sur place) |
| Prestations mariées | Sur devis — remis à plus tard (Gradi reviendra avec les détails) |
| Emails | **AUCUN email tant que l'acompte n'est pas payé** (ni maison, ni cliente). Tout part à la confirmation du paiement. La dépose (sans acompte) garde ses emails immédiats actuels |
| Pièces jointes cliente | Message + ticket de réservation PDF + fichier agenda .ics + **facture d'acompte PDF** (nouveau) |
| Vocabulaire | Toujours écrire « réservation » (jamais d'abréviation) |
| Interrupteur | `PAYMENTS_ENABLED` — éteint, le site se comporte exactement comme aujourd'hui |
| Remis à plus tard | Retards & remboursements · paiement des formations · CGV (phase conformité) · compte Stripe officiel (jour de l'allumage) |

## Le parcours (option A)

1. La cliente choisit sa prestation et son créneau dans le tunnel actuel (rien
   ne change dans les 4 étapes).
2. Au récapitulatif : « Acompte à régler en ligne : X € · Reste sur place :
   Y € », bouton « Payer l'acompte et réserver ».
3. Le serveur enregistre la réservation avec le statut `awaiting_payment` et
   une expiration à **+30 minutes** → le créneau est bloqué pour les autres.
4. La cliente est envoyée sur la page de paiement Stripe (CB, Apple Pay,
   Google Pay, en français). Le numéro de carte ne touche jamais notre serveur.
5. **Payé** → Stripe appelle notre webhook (signé) → la réservation passe en
   `confirmed`, la facture d'acompte est générée, **les emails partent à ce
   moment-là seulement**. La cliente revient sur notre page de merci avec sa
   référence MK-XXXX.
6. **Pas payé en 30 min** (abandon, carte refusée…) → la session Stripe expire,
   la réservation en attente est annulée, le créneau redevient libre. Si elle
   clique « retour » sur la page Stripe, le créneau est libéré immédiatement.

## Base de données (Supabase)

- `bookings.status` accepte un nouvel état : `awaiting_payment`
  (check étendu : `pending / awaiting_payment / confirmed / cancelled`).
- Nouvelles colonnes : `deposit_cents int` (montant de l'acompte en centimes),
  `stripe_session_id text`, `expires_at timestamptz`, `paid_at timestamptz`,
  `invoice_number text`.
- La contrainte d'exclusion anti-chevauchement reste telle quelle : elle ignore
  seulement `cancelled`, donc une réservation `awaiting_payment` **bloque le
  créneau automatiquement**.
- `get_taken_slots` ignore désormais les `awaiting_payment` dont `expires_at`
  est dépassé → un créneau abandonné disparaît du calendrier sans intervention.
- `create_booking` : nouveaux paramètres optionnels (statut, acompte,
  expiration) — les appels existants restent valides ; avant l'insertion, les
  blocages expirés qui chevauchent sont annulés (sinon la contrainte
  d'exclusion refuserait un créneau pourtant libre).
- Nouvelles fonctions RPC `security definer` (même modèle que l'existant) :
  - `confirm_paid_booking(id, session_id)` — **idempotente** : ne confirme
    qu'une fois même si Stripe notifie deux fois ; attribue le numéro de
    facture (séquence Postgres continue, format `FA-2026-0001`) ; renvoie les
    données nécessaires aux emails.
  - `cancel_payment_hold(id)` — annule uniquement si encore `awaiting_payment`
    (page abandon + webhook d'expiration).
  - `attach_stripe_session(id, session_id)` — relie la réservation à sa
    session de paiement.

## Montants

`depositCentsFor(service)` dans `lib/services.ts` : table par catégorie
(`ongles: 2000, maquillage: 3000, cils: 2000`), la dépose renvoie 0. Un
montant se change en UNE ligne, comme les tarifs. Les montants sont stockés en
centimes (jamais de virgule flottante pour de l'argent).

## Routes serveur

- `POST /api/bookings` (existante, aiguillage ajouté) :
  - acompte = 0 € **ou** `PAYMENTS_ENABLED` éteint → circuit actuel intact
    (insertion `pending` + emails immédiats).
  - acompte > 0 → insertion `awaiting_payment` (+30 min), création de la
    session Checkout (montant, référence MK-XXXX en métadonnées, expiration
    30 min, email de la cliente prérempli), réponse `{ reference, checkoutUrl }`.
    Si Stripe est injoignable → blocage annulé + erreur propre (503).
- `POST /api/stripe/webhook` (nouvelle) : vérifie la **signature**
  (`STRIPE_WEBHOOK_SECRET`) — c'est elle qui fait office d'authentification
  (pas de contrôle d'origine ici : c'est Stripe qui appelle, pas un
  navigateur). Événements :
  - `checkout.session.completed` → `confirm_paid_booking` + génération facture
    + envoi des emails (une seule fois, garanti par l'idempotence).
  - `checkout.session.expired` → `cancel_payment_hold`.
  - Particularité : les confirmations sont traitées même en mode cadenas
    (`SECURITY_LOCKDOWN`) — l'argent est encaissé, la cliente doit recevoir sa
    confirmation.
- `GET /api/bookings/status` (nouvelle, minimaliste) : renvoie uniquement
  `{ status, reference }` pour la page de merci — aucune donnée personnelle.
- `POST /api/bookings/cancel-hold` (nouvelle) : libère le créneau depuis la
  page d'abandon (même-origine + limite de débit, n'agit que sur
  `awaiting_payment`).

## Pages et interface

- Tunnel : le récapitulatif affiche l'acompte et le reste à payer sur place ;
  le bouton devient « Payer l'acompte et réserver » ; après la réponse du
  serveur, redirection vers Stripe. Les prestations sans acompte gardent
  l'écran de confirmation actuel.
- `/reservation/merci` : confirmation avec la référence — interroge le statut
  (petite attente élégante si le webhook a une seconde de retard).
- `/reservation/annulee` : « paiement abandonné, le créneau a été libéré » +
  bouton pour recommencer.

## Emails et facture d'acompte

- Règle : **envoi uniquement à la confirmation du paiement** (webhook). Aucun
  email en `awaiting_payment`.
- Les deux gabarits (maison + cliente) gagnent : « Acompte réglé en ligne :
  X € — Reste à régler sur place : Y € ».
- **Facture d'acompte PDF** (`lib/facture-pdf.ts`, pdf-lib, charte
  ivoire/bronze comme le ticket) : numéro `FA-2026-XXXX` (séquence continue —
  obligation légale), date, cliente, prestation et date du rendez-vous,
  acompte TTC, mention « Acompte sur prestation — solde à régler sur place »,
  moyen de paiement « carte bancaire en ligne (Stripe) ».
  ⚠️ Les coordonnées légales (raison sociale, adresse, SIRET, régime de TVA)
  sont celles de la phase conformité : tant qu'elles manquent, le gabarit
  porte des champs clairement marqués « à compléter » et **le vrai allumage ne
  se fera pas sans elles**. Jointe à l'email cliente ET à la notification
  maison (comptabilité).

## Variables et sécurité

- Nouvelles variables : `PAYMENTS_ENABLED` (0/1), `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET`. **Gradi colle les clés lui-même** (.env.local et
  Vercel) — Claude ne voit jamais les secrets. Jamais de pipe PowerShell
  (piège BOM) : éditeur de texte ou dashboard.
- Pas de clé publique nécessaire : la page hébergée évite tout script Stripe
  sur notre site (la CSP stricte reste inchangée).
- Le webhook est idempotent et signé ; les routes nouvelles respectent la
  limite de débit existante.

## Tests (aucun vrai argent, jamais en production sans Gradi)

1. Tests unitaires des fonctions pures : montants d'acompte, gabarits
   d'emails, contenu de la facture.
2. Parcours complet en **mode test Stripe** (carte `4242 4242 4242 4242`,
   cartes de refus, abandon, expiration) en local puis sur un déploiement de
   prévisualisation Vercel — pas sur maisonkanali.fr.
3. Vérifications base : le blocage 30 min bloque bien le créneau, l'expiration
   le libère, aucune double confirmation, aucun email avant paiement.

## Checklist du vrai allumage (plus tard, décision Gradi)

1. Compte Stripe **officiel** de la maison activé par Kandy & Nafi (identité,
   SIRET / statut auto-entrepreneur, **IBAN**) — c'est là que les virements
   automatiques arrivent (par défaut quotidiens, ~2-3 jours ouvrés par
   paiement, ~7 jours pour le tout premier ; commission ~1,5 % + 0,25 €).
2. Coordonnées légales complètes dans la facture + mentions légales + **CGV**
   en ligne (phase conformité).
3. Clés réelles dans Vercel (Sensitive) + webhook de production configuré dans
   le dashboard Stripe.
4. `PAYMENTS_ENABLED=1` + déploiement + test réel d'1 € convenu avec Gradi.

## Ce qui ne change pas

La dépose et son circuit actuel · les formations · le calendrier, les
horaires, la sécurité existante · et TOUT le site tant que l'interrupteur est
éteint — le code peut partir en production éteint sans aucun effet visible.
