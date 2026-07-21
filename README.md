# Maison Kanali — Site officiel

Site vitrine et système de prise de rendez-vous de **Maison Kanali**, showroom
beauté & centre de formation à Saint-Quentin :

- **Kandylove Beauty** — prothésie ongulaire, maquillage, formations (maison principale)
- **Naftali** *by Maison Kanali* — extensions de cils, formations

> Conçu par **Gradi Palaba**, ingénieur chez **Gald Corp** — maintenu par Gald Corp.

## Stack

| Rôle | Techno |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styles | Tailwind CSS v4 — design system dans `app/globals.css` |
| Base de données | Supabase (Postgres) — réservations & demandes de formation |
| Emails | Resend — notification à la maison + accusé de réception client |
| Hébergement | Vercel |

## Démarrer en local

```bash
npm install
cp .env.example .env.local   # puis remplir les variables
npm run dev                  # http://localhost:3000
```

## Variables d'environnement

Voir [.env.example](.env.example) :

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — projet Supabase.
- `RESEND_API_KEY` — clé Resend. **Sans elle, le site fonctionne** (les
  réservations sont enregistrées) mais aucun email n'est envoyé.
- `BOOKING_EMAIL_TO` — l'adresse de Maison Kanali qui reçoit les notifications.
- `BOOKING_EMAIL_FROM` — expéditeur (domaine vérifié Resend, sinon
  `onboarding@resend.dev`).

## Base de données

Le schéma complet est dans [supabase/schema.sql](supabase/schema.sql) (à
exécuter dans l'éditeur SQL Supabase pour recréer la base) :

- `bookings` — rendez-vous, protégés par une **contrainte d'exclusion**
  Postgres : deux réservations ne peuvent jamais se chevaucher, même
  simultanées.
- `formation_requests` — demandes d'inscription aux formations.
- RLS activée sans policy : le navigateur ne lit jamais les tables. Tout passe
  par les RPC `security definer` (`get_taken_slots`, `create_booking`,
  `create_formation_request`) appelées depuis les routes API.

## Modifier les contenus courants

| Quoi | Où |
|---|---|
| **Tarifs, durées, prestations, formations** | [lib/services.ts](lib/services.ts) |
| Horaires d'ouverture, créneaux, ville, réseaux | [lib/config.ts](lib/config.ts) |
| Textes des emails | [lib/email.ts](lib/email.ts) |
| Couleurs & typographies | [app/globals.css](app/globals.css) |
| Visuels | `public/images/` |

## Structure

```
app/                  Pages (App Router) + routes API
  api/availability    GET  — créneaux disponibles d'une journée
  api/bookings        POST — création de rendez-vous (+ emails)
  api/formations      POST — demande d'inscription formation
  rendez-vous/        Wizard de réservation + confirmation
components/
  booking/            Étapes du wizard (service, date, coordonnées…)
  home/               Sections de la page d'accueil
  layout/             Header, footer, barre mobile
  ui/                 Design system (Reveal, menus, icônes…)
lib/                  Config, catalogue, disponibilité, validation, emails
supabase/schema.sql   Schéma complet de la base
docs/design.md        Document de design (DA, arborescence, parcours)
```

## Réservation — fonctionnement

1. La cliente choisit une prestation (ou une formation), une date puis un
   créneau : les créneaux déjà pris sont récupérés en direct
   (`/api/availability`) et grisés.
2. À l'envoi, `create_booking` insère le rendez-vous **de manière atomique** :
   si le créneau vient d'être pris, l'API répond `409` et le wizard ramène la
   cliente au choix du créneau avec les disponibilités rafraîchies.
3. Deux emails partent via Resend : notification à Maison Kanali (avec
   `replyTo` vers la cliente) et accusé de réception élégant à la cliente.
4. Les rendez-vous naissent au statut `pending` — la maison confirme ensuite
   (un espace de gestion pourra être ajouté en phase 2).
