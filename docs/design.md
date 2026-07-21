# Maison Kanali — Document de design

*Version 1.0 — 21 juillet 2026. Conçu par Gradi Palaba (Gald Corp).*

## 1. Positionnement

Maison Kanali est un **showroom beauté sur rendez-vous** à Saint-Quentin. Le site est
sa vitrine digitale et, surtout, **son outil de prise de rendez-vous**. Référence
esthétique : Swarovski — luxe lumineux, épuré, généreux en espace blanc, navigation
limpide. Le site doit être irréprochable sur mobile (dimension prioritaire).

Deux univers sous un même toit :

| | Kandylove Beauty | Naftali |
|---|---|---|
| Rôle | Activité principale (8+ ans) — CEO : Viminde Kandy | « By Maison Kanali » — CEO : Viminde Nafi |
| Métiers | Prothésie ongulaire, maquillage | Extensions de cils |
| Formations | Onglerie (coaching privé 2 jours) | Extensions de cils |
| Codes visuels | Terracotta, rose pâle | Ivoire, or |

## 2. Direction artistique

### Palette

| Token | Hex | Usage |
|---|---|---|
| `ivory` | `#FDFBF7` | Fond principal (blanc cassé chaud) |
| `white` | `#FFFFFF` | Surfaces, cartes |
| `sand` | `#F4EDE3` | Beige clair — sections alternées |
| `sand-deep` | `#E7DCCC` | Bordures, séparateurs |
| `blush` | `#F7EAE3` | Rose très pâle — halos, fonds doux |
| `blush-deep` | `#EDD6CB` | Accents rosés |
| `bronze` | `#A9744F` | Terracotta du logo — CTA, accents |
| `bronze-dark` | `#8A5C3D` | Hover des CTA |
| `gold` | `#C2A05F` | Fil d'or Naftali, détails précieux |
| `espresso` | `#2E241C` | Texte principal (noir chaud) |
| `taupe` | `#80705F` | Texte secondaire |

### Typographies (Google Fonts, via `next/font`)

- **Cormorant Garamond** (400–600 + italique) — titres, chiffres tarifs, esprit du
  logo « *Maison* KANALI ».
- **Jost** (300–500) — texte courant, labels espacés en capitales (`0.2em`).

Le logo est reproduit en texte stylé dans le header/footer (net à toutes les
résolutions) ; les fichiers logos fournis sont utilisés dans les pages.

### Motifs signature

- **Arche** (border-radius supérieur complet) pour les visuels — évoque un écrin.
- **Filets hairline** `1px` sand-deep / or en soulignement de titres.
- Reveals doux à l'entrée du viewport (`opacity + translateY`, 600 ms), stagger 80 ms.
- Boutons rectangulaires (radius 2 px), plein bronze ou contour espresso.

## 3. Arborescence (multi-pages, pas de scroll infini)

```
/                    Accueil — hero, les deux pôles, prestations phares,
                     l'expérience (sur RDV), fondatrices, bandeau CTA
/kandylove           Kandylove Beauty — onglerie (carte tarifaire) + maquillage
/naftali             Naftali — extensions de cils (ivoire & or)
/formations          Les 2 formations professionnelles (contenu des flyers)
/rendez-vous         Réservation en 4 étapes (+ ?service= pour pré-sélection)
/rendez-vous/confirmation   Récapitulatif après réservation
/a-propos            Histoire, fondatrices, valeurs, infos pratiques, crédit
/mentions-legales    Mentions légales minimales
```

Navigation : header sticky fin (logo + 5 entrées + CTA « Prendre rendez-vous »),
menu mobile plein écran. Le CTA rendez-vous est accessible depuis chaque page
(header + cartes prestations + bandeau final).

## 4. Réservation — parcours en 4 étapes

Wizard une-étape-à-l'écran (jamais de page interminable), barre de progression :

1. **Prestation** — univers (Kandylove ongles / Kandylove maquillage / Naftali cils)
   puis prestation précise (durée + tarif affichés).
2. **Date & créneau** — calendrier custom (dimanche fermé, passé désactivé) ;
   créneaux de 30 min entre **10 h et 17 h (lun–sam)** filtrés par la durée de la
   prestation ; les créneaux pris sont grisés « Indisponible » en temps réel.
3. **Coordonnées** — prénom, nom, email, téléphone, précisions (optionnel).
4. **Confirmation** — récapitulatif complet avant envoi.

**Formations** : parcours distinct (pas de créneau horaire) — formulaire de demande
d'inscription (formation choisie, avec/sans kit pour l'onglerie, message). La date
sera convenue avec l'élève par Maison Kanali.

### Modèle de données (Supabase Postgres)

- `bookings` : identité client, prestation (id, nom, marque, durée, tarif),
  `booking_date`, `start_time`/`end_time`, notes, statut (`pending` par défaut).
  **Contrainte d'exclusion** Postgres (`btree_gist`) sur
  `(booking_date, plage horaire)` → deux réservations ne peuvent jamais se
  chevaucher, même en cas de demandes simultanées.
- `formation_requests` : identité, formation, option kit, message, statut.
- Accès **uniquement** via fonctions RPC `SECURITY DEFINER`
  (`get_taken_slots`, `create_booking`, `create_formation_request`) appelées par
  les routes API du serveur Next. RLS activée, aucune policy anonyme : les données
  clients ne sont jamais lisibles depuis le navigateur.

### API (routes Next)

- `GET /api/availability?date=YYYY-MM-DD&serviceId=…` → créneaux avec statut.
- `POST /api/bookings` → validation zod, RPC atomique ; si le créneau vient d'être
  pris → `409` et message invitant à choisir un autre créneau.
- `POST /api/formations` → enregistrement demande de formation.

### Emails (Resend)

À chaque réservation : email professionnel HTML aux couleurs de la maison envoyé
**à Maison Kanali** (`BOOKING_EMAIL_TO`) + accusé de réception élégant au client.
Sans `RESEND_API_KEY`, la réservation est enregistrée et le site fonctionne (les
emails sont simplement désactivés — clé à ajouter dans Vercel).

## 5. Contenus clés

- Tarifs maquillage : flyer TARIF (mariée 80 €, naturel 50–60 €, full face 65–70 €).
- Onglerie : pose complète, remplissage, nail art, entretien — « à partir de 50 € »
  (business plan). Tarifs précis à confirmer par Maison Kanali dans
  `lib/services.ts`.
- Cils Naftali : menu classique/mixte/volume — tarifs « communiqués à la
  réservation » tant que non fournis.
- Formation onglerie : 2 jours, 350 € sans kit / 420 € avec kit + inclus (flyer).
- Horaires : lundi–samedi, 10 h – 17 h. Instagram : @kandylovebeauty,
  @naftali.lashes. Coordonnées précises = placeholders à remplacer.
- À propos : histoire (8 ans d'expérience → showroom), Viminde Kandy (fondatrice &
  gérante, pôle beauté), Viminde Nafi (co-fondatrice, associée stratégique),
  valeurs condensées, crédit final : « Site conçu par Gradi Palaba, ingénieur chez
  Gald Corp — maintenu par Gald Corp ».

## 6. Qualité

- Mobile-first : composition vérifiée à 375 px ; cibles tactiles ≥ 44 px.
- Performance : polices `next/font`, images `next/image`, zéro librairie UI lourde.
- Accessibilité : contrastes AA, focus visibles, labels de formulaire explicites,
  navigation clavier du wizard.
- SEO : metadata par page, Open Graph, sitemap, robots.
