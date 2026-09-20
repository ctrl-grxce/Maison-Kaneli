# 📌 Maison Kanali — Suivi du projet (à faire & progression)

*Fichier de bord demandé par Gradi (29/08/2026). **Claude : lis ce fichier en
premier à chaque reprise d'une conversation sur Maison Kanali**, et mets-le à
jour à chaque avancée. Dernière mise à jour : **20/09/2026**.*

## 🚦 En ce moment

**JOUR DU LANCEMENT — 18/09/2026, objectif : site complet à 20h.**

✅ **Statut tranché le 18/09 par Gradi** : les fondatrices sont passées en
**association loi 1901 à but non lucratif**. Numéros transmis :
**RNA W023006110** · **SIRET 98294433200013** · siège **19 chemin d'Harly,
02100 Saint-Quentin** · représentante **Viminde Kandy** · **TVA non
applicable (art. 293 B du CGI)** · **droit français**. Gradi veut aussi le
**paiement des acomptes ACTIF au lancement**.

✅ **Conformité TERMINÉE le 18/09** (commit `5309bda`) — voir ② ci-dessous.

⏳ **Il ne reste que des actions côté Gradi** (secrets Vercel + déploiement),
puis le référencement. Voir « ① Mise en ligne ».

⚠️ **Point non tranché** : le SIREN du SIRET fourni (982944332) est celui
noté le 30/08 sous le statut *entrepreneur individuel*. Une association
immatriculée reçoit normalement son propre SIREN. Gradi a confirmé le choix
« association » malgré cette alerte — à revérifier auprès des fondatrices
(si le SIRET est bien celui de l'entreprise individuelle, il faudra soit le
remplacer par celui de l'association, soit rebasculer les mentions vers le
statut entrepreneur : **une seule constante `LEGAL` dans `lib/config.ts`**).

## ✅ État du site — tout est en prod et fonctionne

| Élément | État |
|---|---|
| Production | ✅ **https://maisonkanali.fr** (HTTPS, redirections 308 depuis www et maison-kanali.vercel.app) |
| Dernier déploiement | ✅ 20/09 — référencement (`b409ec9`) + réservation ouverte jusqu'en 2030 (`55b4db0`), vérifié en ligne |
| Réservation en ligne | ✅ Wizard 4 étapes, anti-chevauchement testé (409), **créneaux de 10h à 17h pour toutes les prestations** (dernier départ 17h, même si la prestation finit après 18h) |
| Emails | ✅ Notification maison + ticket cliente (PDF A5 + invitation .ics) via Gmail `gradipalaba28@gmail.com`, reply-to maisonkanali@gmail.com |
| Promo cils | ✅ Les 4 poses à 40 € jusqu'au 31/10 (expiration automatique) ; la dépose est HORS promo (20 € définitif) |
| Base | ✅ Supabase `aatzhqzntpzubkvnriop` (eu-west-3, gratuit) + cron Vercel 6h UTC → `/api/health` (anti-pause) |
| Domaine | ✅ maisonkanali.fr chez LWS (compte LWS-822560), expire 21/08/2027, renouvellement auto |
| Sécurité | ✅ CSP/HSTS, rate limiting, anti-CSRF, honeypots, lockdown 3 étages (`SECURITY_LOCKDOWN`), RLS sans policy anonyme |
| Code | ✅ github.com/ctrl-grxce/Maison-Kaneli · local `C:\Users\gradi\maison-kanali` — tout est commité/pushé |

## 📋 À faire

### ① Mise en ligne — CE QUI RESTE (actions de Gradi, 18/09)

Claude ne touche **jamais** aux secrets ni à la prod sans accord : tout ce
bloc se fait dans le dashboard Vercel, par Gradi.

1. [ ] **Stripe LIVE** — compte officiel « Maison Kanali » :
   vérifier qu'il est **activé** (pas « en cours de vérification »), puis en
   mode **Live** : Développeurs → Webhooks → ajouter l'endpoint
   `https://maisonkanali.fr/api/stripe/webhook` (événement
   `checkout.session.completed`) → récupérer `whsec_…` et `sk_live_…`.
2. [ ] **Variables Vercel, environnement Production** (Settings →
   Environment Variables) :
   `STRIPE_SECRET_KEY` = `sk_live_…` · `STRIPE_WEBHOOK_SECRET` = `whsec_…` ·
   `PAYMENTS_ENABLED` = `1` · `SUPABASE_SERVICE_ROLE_KEY` = la clé secrète
   Supabase · `ADMIN_CODE` = le vrai code de Kandy & Nafi.
   ⚠️ Coller à la main dans le dashboard — jamais par pipe PowerShell (BOM),
   jamais dans le dépôt.
3. [ ] **Déployer** : `npx vercel deploy --prod --yes --scope gradipalaba28-7081s-projects`
4. [ ] **Vérifier en prod après déploiement** :
   - `/cgv`, `/mentions-legales`, `/confidentialite` affichent bien
     **maisonkanali.fr** (et non `maison-kanali.vercel.app` : signifierait
     que `NEXT_PUBLIC_SITE_URL` manque en Production)
   - une vraie réservation avec acompte, carte réelle → email reçu +
     **facture PDF complète** (le pied avec RNA/SIRET doit être ENTIER :
     la mise en page débordait avant le 18/09) → puis annuler et
     **rembourser depuis le dashboard Stripe**
   - `/gestion` : connexion avec le vrai `ADMIN_CODE`
5. [ ] Donner à Kandy & Nafi l'adresse `maisonkanali.fr/gestion` + le code.
6. [x] **Calendriers par pôle — EN PRODUCTION le 18/09 ~20h.** Migration
   collée par Gradi dans l'éditeur SQL Supabase (accord explicite), puis 11
   vérifications réelles sur la base, toutes OK : même créneau même pôle →
   refusé (SLOT_TAKEN) ; chevauchement partiel → refusé ; même créneau autre
   pôle → accepté ; indisponibilité Naftali → Kandylove reste libre ;
   ancienne fonction à 1 argument toujours en service. Base nettoyée.
7. [x] (vérifié le 18/09 : présent en Production ; la route est désormais FERMÉE par défaut) Vérifier que `SECURITY_REPORT_SECRET` est bien défini en Production :
   s'il est vide, n'importe qui peut faire monter le cadenas et **suspendre
   les réservations**.
8. [x] (fait et déployé le 18/09 après paiement réel validé par Gradi) Supprimer la prestation de test à 1 € (`test-paiement-1-euro` dans
   `lib/services.ts`) une fois les tests de paiement terminés.

### ② Conformité — ✅ TERMINÉE le 18/09 (commit `5309bda`)

- [x] Identité légale complète dans `LEGAL` (`lib/config.ts`) : association
      loi 1901, RNA, SIRET, siège, TVA non applicable, représentante.
      **Source unique** — les trois pages et la facture PDF en dérivent.
- [x] **Mentions légales** réécrites (éditeur, hébergeurs, Stripe et Supabase
      comme sous-traitants, maisonkanali.fr, droit français).
- [x] **CGV** créées (`/cgv`) : acomptes, annulation 48 h, remboursement,
      pas de droit de rétractation (art. L221-28), médiation, droit français.
      Montants et délai dérivés du code — la page ne peut pas mentir.
- [x] **Confidentialité** corrigée : elle affirmait « aucune donnée de
      paiement » et « aucun cookie », faux dès Stripe allumé. Ajout du
      transport Gmail réel (et non Resend), des cookies strictement
      nécessaires, et des 10 ans de conservation comptable des factures.
- [x] Durée de conservation « 3 ans » validée (+ exception 10 ans factures).
- [x] Lien CGV en pied de page · rappel des 48 h + acceptation des CGV avant
      le paiement (`StepConfirm`) et sur la page de confirmation.
- [x] Cookies : **aucune bannière nécessaire** — pas de traceur non
      essentiel ; Stripe dépose sur **son** domaine, le cookie `/gestion` est
      strictement nécessaire et jamais posé chez les visiteuses.

**Restes juridiques non bloquants (après le lancement)** :
- [ ] **Médiateur de la consommation** : légalement, un professionnel doit
      adhérer à un médiateur et **le nommer** dans ses CGV (art. L616-1).
      Les CGV disent pour l'instant que ses coordonnées sont communiquées
      sur demande. → adhésion à prévoir (quelques dizaines d'euros/an),
      puis écrire son nom et son adresse dans l'article 9.
- [ ] Confirmer auprès des fondatrices que le **SIRET est bien celui de
      l'association** (cf. alerte en haut de fichier).
- [ ] Vérifier que le **compte Stripe est au nom de l'association** (et non
      de l'entreprise individuelle) — sinon l'encaissement et la facture ne
      désignent pas la même entité.

### ③ Autres chantiers ouverts

- [ ] Retouches design (liste à préciser par Gradi)
- [ ] (reporté par Gradi) Compresser `public/videos/hero.mp4` 11 MB → ~3 MB
- [ ] (proposé le 19/09, pas encore validé) /gestion — deux pièges relevés :
      ① Indisponibilités : le pôle par défaut est Kandylove Beauty, donc Nafi
      ferme l'agenda de Kandy si elle oublie d'appuyer sur « Naftali » →
      obliger à choisir ; ② les rendez-vous sans acompte (dépose, mariée)
      restent « À confirmer » à vie, aucun bouton « Confirmer ».
- [x] **Gestion des rendez-vous** — codée et testée le 03/09 (ci-dessous)

### 📅 Chantier gestion des rendez-vous (état au 03/09)

Cadrage validé par Gradi le 03/09 : page **/gestion** sur le site (rien à
installer), accès par **code secret partagé** (`ADMIN_CODE`), périmètre
complet **voir + annuler + déplacer + bloquer des indisponibilités**, emails
automatiques à la cliente quand la maison annule ou déplace.

1. [x] **Implémentation complète le 03/09** (43 tests verts, typecheck + build OK) :
   - Migration `supabase/migrations/2026-09-03_gestion_rdv.sql` : table
     `blocked_slots` (RLS sans policy), `get_taken_slots` inclut les plages
     bloquées, `create_booking` les refuse (SLOT_TAKEN) — **PAS ENCORE
     APPLIQUÉE** (avec l'OK de Gradi, en même temps que celle du paiement)
   - `lib/gestion-auth.ts` : code secret + cookie signé HMAC 7 jours (5
     essais/15 min par IP ; changer ADMIN_CODE déconnecte tout le monde)
   - Routes `/api/gestion/*` (login, bookings, cancel, reschedule, blocked) —
     clé **service_role** côté serveur uniquement (`getSupabaseAdmin`), rien
     d'exposé à la clé anonyme
   - Emails : annulation (sobre + lien re-réserver + contact remboursement si
     acompte payé) et déplacement (nouveau ticket PDF + .ics)
   - Écran `/gestion` mobile-first dans la charte : onglets Rendez-vous
     (à venir/passés, annuler avec confirmation, déplacer via calendrier +
     créneaux libres) et Indisponibilités (jour entier ou plage, note, retrait)
   - `robots.txt` : /gestion interdit d'indexation (+ noindex sur la page)
2. [x] **Migrations appliquées le 03/09** (via MCP Supabase, OK Gradi) — et
   vérification faite : la migration PAIEMENT du 30/08 était déjà en place
   (la note « pas encore appliquée » était périmée).
3. [x] **Clé secrète Supabase collée par Gradi le 03/09** dans `.env.local`
   (nouvelle « Secret key » `sb_secret_…`, équivalent service_role).
4. [x] **TEST COMPLET LOCAL RÉUSSI le 03/09 ~18h** : connexion (mauvais code
   refusé), liste réelle, déplacement 06/10→17/09 ✅, blocage jour entier →
   0 créneau public + POST direct refusé 409 ✅, retrait → 16 créneaux de
   retour ✅, annulation ✅ (réservation-test MK-DF4571 créée puis annulée par
   Claude ; base propre). Les emails locaux ne partent pas (GMAIL_APP_PASSWORD
   local = marqueur invalide, connu) : l'écran l'affiche honnêtement ; contenus
   couverts par les tests, envoi réel déjà validé en prod le 31/08.
   Amélioration au passage : « À venir » masque annulées/paiements non aboutis,
   onglet « Passés & annulés » les regroupe (même futures).
5. [ ] **Au lancement (Gradi, dashboard Vercel, env Production)** :
   `SUPABASE_SERVICE_ROLE_KEY` (la même clé secrète) + `ADMIN_CODE` (le vrai
   code des filles) — puis déployer, et donner l'adresse /gestion + le code à
   Kandy & Nafi.

### 💳 Chantier paiement (état au 30/08) — spec complète : `docs/PAIEMENT.md`

1. [x] **Cadrage** (29/08) : 3 architectures expliquées. Reco = **option A : Checkout Stripe hébergé + webhook** — résa `awaiting_payment` qui bloque le créneau 30 min → page de paiement chez Stripe → webhook signé → résa confirmée + emails ; pas payé en 30 min → créneau libéré. (Option B Payment Links : rejetée pour les résas, utile plus tard pour les formations. Option C formulaire intégré : trop de code pour rien.)
2. [x] **Architecture VALIDÉE par Gradi (30/08)** : option A — Checkout Stripe hébergé + webhook
3. [x] **Montants décidés par Gradi (30/08)** : acompte **20 € ongles** · **30 € maquillage** (hors prestations mariées → sur devis, Gradi reviendra plus tard là-dessus) · **20 € poses de cils** · **dépose = SANS acompte** (20 € payés sur place, circuit actuel inchangé)
3b. [x] **Règles fixées par Gradi (30/08)** : ① AUCUN email (ni à la maison ni à la cliente) tant que l'acompte n'est pas payé — les emails partent uniquement quand le paiement est confirmé ; ② joindre en plus une **facture d'acompte PDF** au ticket et au fichier agenda ; ③ toujours écrire « réservation », jamais « résa » ; ④ remis à plus tard : retards & remboursements, prestations mariées (sur devis).
4. [ ] **Compte Stripe en mode test** — Gradi le crée (gratuit, pas besoin de SIRET/IBAN en test) et colle les clés dans Vercel lui-même (Claude ne manipule jamais les secrets)
5. [x] **Implémentation CODÉE le 30/08** ✅ (tests 24/24, typecheck et build OK ; tout derrière `PAYMENTS_ENABLED`, éteint par défaut = site public inchangé) :
   - Base : migration `supabase/migrations/2026-08-30_paiement_acomptes.sql` (statut `awaiting_payment`, expiration 35 min, purge auto, RPC idempotentes, séquence facture) — **PAS ENCORE APPLIQUÉE à Supabase** (attend l'OK de Gradi)
   - `lib/services.ts` : acomptes 20/30/20 € (dépose ET mariées exclues — mariées en circuit historique en attendant le « sur devis »)
   - `lib/stripe.ts` (session Checkout 31 min, interrupteur), `lib/facture-pdf.ts` (facture A5 charte), ticket PDF avec bloc acompte (+ bug horaires 17h corrigé), emails « confirmé + 3 pièces jointes »
   - Routes : aiguillage `/api/bookings`, webhook signé `/api/stripe/webhook`, `/api/bookings/status`, `/api/bookings/cancel-hold`
   - Tunnel : récapitulatif acompte/reste, bouton « Payer l'acompte (X €) et réserver », redirection Stripe ; pages retour `/rendez-vous/confirmation` (vérification live) et `/rendez-vous/annule`
6. [x] **Compte Stripe test créé par Gradi le 30/08** (« Maison K test ») + clé `sk_test_` collée dans `.env.local` par Gradi, validée (200 OK) ; `PAYMENTS_ENABLED=1` en local uniquement
6b. **ORDRE CONVENU le 30/08 (avant l'appel avec les fondatrices)** :
   ① appel : valider les PRIX des acomptes (20/30/20, dépose 0) + mariée « sur devis » →
   ② appel : politique de remboursement/annulation (+ SIRET/adresse si possible) →
   ③ ✅ **Réponses rapportées par Gradi (30/08, appel fondatrices)** :
      · maquillage mariée → **SUR DEVIS** (retirer les 80 € du catalogue) ;
      · annulation possible **jusqu'à 48h avant** le rendez-vous — en dessous,
        l'acompte est perdu (mécanique de remboursement à détailler plus tard) ;
      · afficher « En cas de question ou de demande de remboursement,
        contactez maisonkanali@gmail.com » sur la page de confirmation de
        paiement ET sur la facture d'acompte.
      → à IMPLÉMENTER au début de l'étape ④, avant le test →
   ④ test complet en mode test (migration Supabase avec OK Gradi + carte 4242, puis webhook, puis préview Vercel — jamais directement en prod) →
   ⑤ ✅ **Stripe OFFICIEL « Maison Kanali » créé ET configuré par les fondatrices
      le 30/08** (SIRET/IBAN saisis par elles ; vérification Stripe possible sous
      quelques jours — surveiller leurs emails). Consigne donnée : ne rien faire
      dans leur dashboard (jamais « débiter un client manuellement ») ; les clés
      réelles ne seront branchées qu'au lancement officiel →
   ⑥ espace rendez-vous : à voir après, si validé
   · **④ TESTS LOCAUX COMPLETS RÉUSSIS le 30/08** (3 paiements 4242 : FA-2026-0001
     Gradi 30 €, FA-0002 et FA-0003 par Claude 20 € — parcours, blocage créneau,
     webhook 200, factures, page de confirmation + message remboursement : tout ✅ ;
     réservations-tests annulées ensuite, base propre).
   · 📧 **EMAILS DE PRODUCTION VÉRIFIÉS FONCTIONNELS le 31/08 ~1h** :
     réservation-test Dépose MK-17F7E3 faite par Claude sur maisonkanali.fr →
     email de confirmation REÇU (vérifié via le connecteur Gmail), puis
     réservation annulée. Épisode résolu : la panne locale venait du fait que
     GMAIL_APP_PASSWORD est une variable Vercel « sensible » (illisible en
     pull — le pull renvoie un marqueur de 11 caractères, PAS la vraie
     valeur) → ne JAMAIS diagnostiquer une variable sensible via env pull.
     Gradi a recréé un mot de passe d'application le 31/08 et l'a collé sur
     Vercel (Prod + Preview) + redéployé la prod lui-même. ⚠️ `.env.local`
     contient toujours le marqueur invalide : pour de futurs tests d'emails
     EN LOCAL, Gradi devra y coller le vrai mot de passe (ligne
     GMAIL_APP_PASSWORD=) — pas bloquant.
   · Démo préview pour les sœurs : déployée (maison-kanali-95i6xrlja-…vercel.app,
     variables preview posées) mais **bloquée par la protection Vercel** —
     Gradi doit désactiver « Vercel Authentication » dans Settings →
     Deployment Protection (lien direct donné le 30/08).
   · Infos légales (30/08, presque complètes) : statut **entrepreneur** ·
     **SIREN 982944332** (⚠️ 9 chiffres — demander le SIRET complet 14 chiffres
     + au nom de qui) · adresse : **19 chemin d'Harly, 02100 Saint-Quentin**
     (Gradi a écrit « 0200 », corrigé en 02100 — à confirmer) · email officiel :
     **maisonkanali@gmail.com**.
7. [ ] **Plus tard, pour allumer en vrai** (décision Gradi) : compte Stripe officiel de la maison (SIRET/IBAN de Kandy & Nafi), clés réelles, coordonnées légales dans `LEGAL` (lib/config.ts) + CGV (→ conformité), et sans doute Vercel Pro 20 $/m + Supabase Pro 25 $/m

### ② Conformité (après ①)

- [ ] Coordonnées légales complètes de la cliente (adresse exacte, SIRET, email officiel) dans les mentions légales — à demander à Kandy/Nafi
- [ ] Ajouter maisonkanali.fr dans les mentions légales
- [ ] Valider la durée de conservation « 3 ans » écrite dans /confidentialite
- [ ] CGV/CGU dès que le paiement en ligne est actif + revoir la question cookies (Stripe en dépose)

### ③ Référencement — démarré le 19/09

Constat du 19/09 : les moteurs ne connaissent pas encore le site — une
recherche « Maison Kanali Saint-Quentin » ne fait sortir que le dépôt
GitHub public, pas maisonkanali.fr.

- [x] **Codé le 19/09, EN LIGNE le 20/09** (commit `b409ec9`) : titres « prestation + ville »,
      descriptions de 160 caractères au plus, aperçu de partage propre à chaque
      page (avant : toutes affichaient le titre de l'accueil), adresse
      canonique, nom du site (WebSite) et code postal dans les données
      structurées. Source unique : `lib/seo.ts` (le sitemap en dérive).
- [ ] **Gradi** — Search Console : propriété « Domaine » maisonkanali.fr,
      enregistrement TXT chez LWS. **Le déploiement est fait (20/09) — c'est
      la prochaine action, plus rien ne bloque** : envoyer
      `sitemap.xml`, demander l'indexation de /, /kandylove, /naftali, /formations.
- [ ] **Gradi** — Bing Webmaster Tools : « Importer depuis Google Search Console ».
- [ ] **Fondatrices** — fiche Google (Google Business Profile) : premier levier
      pour « extension de cils Saint-Quentin » (carte Google). À trancher :
      adresse affichée ou simple zone desservie.
- [ ] Liens vers le site : bios Instagram (@kandylovebeauty, @naf.lashes),
      page Facebook, fiche PagesJaunes gratuite ; dépôt GitHub : ajouter
      maisonkanali.fr dans « About », ou le passer en privé.
- [ ] Plus tard : avis Google des clientes ; vidéo d'accueil de 11 Mo à
      compresser (vitesse sur mobile).

### 📆 Rappels datés

- **Début novembre 2026** : retirer À LA MAIN la bannière « Toutes les poses à 40 € » sur `/naftali` (les prix, eux, expirent tout seuls le 31/10) + nettoyer les champs `promo` morts dans `lib/services.ts`
- **21/08/2027** : renouvellement auto du domaine chez LWS — vérifier le moyen de paiement

### 🧹 Fond de tiroir (quand Gradi veut)

- Mettre maisonkanali.fr dans les bios Instagram (@kandylovebeauty / @naf.lashes) + prévenir Kandy & Nafi
- Gmail : recréer le mot de passe d'application SUR maisonkanali@gmail.com puis rebasculer `GMAIL_USER` sur Vercel
- `fondatrices.jpg` est encore une image IA → vraie photo des deux sœurs un jour
- Renommer le repo GitHub `Maison-Kaneli` → `Maison-Kanali` (optionnel)

## 📖 Journal de progression

- **20/09** : demande de Gradi — « le planning s'arrête seulement jusqu'en
  novembre ». C'était l'horizon de réservation de 60 jours (`OPENING.horizonDays`,
  `lib/config.ts`) : au-delà du 19/11, la flèche « mois suivant » était grisée.
  Horizon passé à une **fenêtre glissante d'environ 5 ans** (`5 * 365 + 1`), donc
  toute l'année 2030 est réservable et la fenêtre avance chaque jour. Un seul
  réglage : le calendrier public, l'API `/api/availability`, la réservation et le
  déplacement dans /gestion en dérivent. Dans la foulée, le calendrier gagne
  **deux listes « mois » et « année »** (l'en-tête figé devient cliquable) :
  sans elles, atteindre 2030 demandait une cinquantaine de clics sur la
  flèche. Les listes ne proposent que la fenêtre autorisée (pas de mois
  passé, rien après l'horizon) et changer d'année ramène le mois dans la
  plage. 3 tests ajoutés (63 au total), typecheck et build OK. Vérifié en local : calendrier jusqu'à **septembre 2031** (flèche
  grisée au 20/09/2031), mardi 11 juin 2030 → 15 créneaux de 10h à 17h ; l'API
  ouvre 2030-12-31 et refuse 2031-09-22. **Déployé (commit `55b4db0`) avec le
  référencement du 19/09 (`b409ec9`), et vérifié en ligne** : sur
  maisonkanali.fr la liste « année » va de 2026 à 2031, juin 2030 s'atteint en
  deux clics, mardi 11 juin 2030 rend 15 créneaux, l'API refuse le 22/09/2031
  et les titres de pages sont bien les nouveaux.
- **19/09** : demande des fondatrices : **on réserve jusqu'à 17h00 pour TOUTES les prestations**, même quand la prestation finit après 18h (volume russe à 17h → 19h30). Avant, le dernier départ était 18h − durée (15h30 pour un volume russe). Seule la dépose perd un créneau (17h30 → 17h00). Nouveau réglage `OPENING.lastStartMinutes` dans `lib/config.ts` et règle unique `isBookableStart` pour le site, la réservation et le déplacement dans /gestion. La fermeture affichée reste 10h–18h. 7 tests ajoutés (52 au total), typecheck et build OK. Vérifié en local : 15 créneaux de 10h à 17h pour chaque prestation, 17h30 refusé par le serveur. **Déployé (commit `ba47f09`) et vérifié en ligne** : 15 créneaux de 10h à 17h pour chaque prestation sur maisonkanali.fr.
- **18/09 (après lancement)** : accueil « Nos services » (cartes titrées « Ongles & maquillage » / « Extensions de cils », pastilles de prestations) ; **formation onglerie 350 € sans kit / 420 € avec kit** (avant 650/720). Déployé et vérifié en ligne.
- **18/09 ~20h — LANCEMENT** : paiement réel testé de bout en bout par Gradi (« tout marche »), prestation à 1 € retirée, signalement de sécurité fermé par défaut. **Reste après lancement** : référencement (Search Console + Bing), médiateur de la consommation, tarifs de la page d'accueil à contraster (3,96:1), débordement de 5 px sur /formations en mobile, rate limit partagé entre instances.
- **18/09 (soir) — retours de Gradi et de Nafi, tout codé et poussé, RIEN
  DÉPLOYÉ depuis le déploiement du paiement** :
  · `5ada19f` /gestion — barre de recherche, fiches restructurées pour être
    parcourues, œil « afficher le code » ; **prestation de test à 1 €** dans
    le tunnel (invisible sur les vitrines) — ⚠️ À SUPPRIMER après les tests.
  · `1d59f7b` sécurité — faille GRAVE corrigée : le verrou « 5 essais » du
    login était contournable en falsifiant `x-forwarded-for`, donc brute
    force illimité sur la seule serrure du site. Plafond global, cadenas
    d'urgence qui ferme enfin /gestion, `no-store` sur les données clientes.
  · `768e0da` **calendriers par pôle** — bug signalé par Nafi, en réalité
    plus large : les RENDEZ-VOUS aussi étaient partagés (une cliente chez
    Kandy à 14h fermait 14h chez Naftali). Gradi a confirmé qu'elles
    travaillent en parallèle. **Migration écrite, PAS APPLIQUÉE.**
  · `d44b0c9` cartes — le prix était l'élément le MOINS contrasté des cartes
    (2,39:1 chez Naftali) ; 0 échec AA sur les trois pages après correction.
  → **Remboursement Stripe : PAS automatique**, mais deux clics dans le
    dashboard, sans avoir besoin du RIB de la cliente.

- **18/09 (jour du lancement)** : statut tranché — **association loi 1901**
  (RNA W023006110, SIRET 98294433200013, siège 19 chemin d'Harly à 02100
  Saint-Quentin, TVA non applicable, droit français). **Toute la conformité
  bouclée** (commit `5309bda`) : `LEGAL` complété comme source unique, CGV
  créées, mentions légales réécrites, confidentialité corrigée (elle niait
  le paiement en ligne et les cookies), rappel des 48 h + acceptation des
  CGV avant paiement. **Bug découvert et corrigé** : la facture d'acompte A5
  débordait déjà de la page AVANT ce commit (dernière ligne à y = -7) — les
  trois factures de test du 30/08 étaient tronquées ; rythme vertical
  resserré, le pied légal tient désormais à y = 23. 43 tests, typecheck et
  build OK. Reste : secrets Vercel + déploiement (Gradi), puis référencement.

- **30/08 (suite)** : chantier paiement CODÉ de bout en bout (base, Stripe,
  facture d'acompte PDF, emails, tunnel, pages de retour) — 24 tests verts,
  build OK, tout éteint par défaut. Migration Supabase préparée, pas encore
  appliquée. Bug corrigé au passage : horaires en dur « 10h-17h » sur le
  ticket PDF (désormais dérivés de `lib/config.ts`).
- **30/08** : ce fichier devient LE fichier de suivi (l'ancien « point de reprise » est remplacé).
- **29/08** : dépose cils → **20 € prix normal, hors promo** (commit `40f7f1f`, déployé + vérifié). Cadrage complet du paiement (3 options, reco option A). `docs/DOMAINE.md` mis à jour et commité.
- **24-25/08** : **maisonkanali.fr acheté** (LWS) et 100 % configuré — DNS (A 216.198.79.1 + 64.29.17.1), HTTPS, redirections 308, `NEXT_PUBLIC_SITE_URL`, sitemap/robots sur le .fr.
- **23/08** : horaires **10h–18h** partout (tout dérive de `lib/config.ts`) ; dépose à 20 € (alors en promo). Déployé.
- **16-17/08** : emails opérationnels (ticket **PDF** + **.ics** des deux côtés), promo 40 € auto-expirante, favicon MK, JSON-LD BeautySalon, cron anti-pause Supabase.
- **04/08** : vrais tarifs ongles, nouveau film hero (soie ivoire + poudre d'or), page /confidentialite (RGPD), accessibilité AA, fonctions serveur à Paris (cdg1).
- **24/07** : 11 photos réelles, film de marque unique, formulaire formations, sécurité renforcée (clés hors code, honeypots, lockdown, CSP).

## 🛠️ Commandes & pièges

```powershell
cd C:\Users\gradi\maison-kanali
npm run dev            # local http://localhost:3000
npm run build          # vérifier que tout compile
git push               # publier sur GitHub (ne déploie RIEN : pas d'intégration Git Vercel)
npx vercel deploy --prod --yes --scope gradipalaba28-7081s-projects   # déployer en prod
```

- ⚠️ **Déploiement prod = uniquement sur accord explicite de Gradi** (idem tests qui envoient de vrais emails ou écrivent en base).
- ⚠️ CLI Vercel 59 : sans `--scope gradipalaba28-7081s-projects` → « Not authorized ».
- ⚠️ Jamais de pipe PowerShell vers `vercel env add` (BOM invisible) — dashboard ou `printf` sous Git Bash.
- Tarifs/durées : tout se règle dans `lib/services.ts` ; horaires/coordonnées dans `lib/config.ts`.

## 🧠 Rappels de contenu (validés par les fondatrices)

- **UNE maison, DEUX pôles** — jamais « deux maisons » ni « deux entreprises ». Les DEUX sœurs sont **co-fondatrices de Maison Kanali** ; chacune est fondatrice de SA marque : Viminde Kandy → **Kandylove Beauty** (ongles, maquillage, formations) ; Viminde Nafi → **Naftali** (cils).
- Horaires : lundi–samedi, 10h–18h, sur rendez-vous uniquement. **Dernier rendez-vous à 17h, quelle que soit la prestation** (fondatrices, 19/09).
- Réservations : pas de 30 min, 90 min de délai minimum le jour même, **horizon glissant d'environ 5 ans** (le calendrier va aujourd'hui jusqu'au 20/09/2031 — avant : 60 jours, il s'arrêtait en novembre), heure de Paris.
