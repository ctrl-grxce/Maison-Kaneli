# 📌 Maison Kanali — Suivi du projet (à faire & progression)

*Fichier de bord demandé par Gradi (29/08/2026). **Claude : lis ce fichier en
premier à chaque reprise d'une conversation sur Maison Kanali**, et mets-le à
jour à chaque avancée. Dernière mise à jour : **30/08/2026**.*

## 🚦 En ce moment

**SPRINT DE LANCEMENT (plan fixé par Gradi le 03/09)** :
- **03/09 avant 17h** : espace de gestion des rendez-vous (✅ CODÉ, voir
  chantier ci-dessous) + retouches design (⏳ liste attendue de Gradi).
- **03/09, appel fondatrices FAIT** : adresse confirmée (02100) ; SIRET 14
  chiffres à venir (Gradi le donnera) ; **⚠️ elles passent en ASSOCIATION
  loi 1901 — en cours de validation** (Gradi transmettra nom/RNA/adresse).
  Conséquence actée : lancement possible sous le statut actuel (compte Stripe
  vérifié), bascule des mentions légales + factures vers l'association quand
  elle existera. Email de vérification Stripe non reçu mais compte annoncé bon.
- **03/09 soir / 04/09** : cookies + mentions légales/CGV (conformité), puis
  référencement. Objectif : le 04/09 il ne reste QUE juridique + référencement.
- **Ensuite : LANCEMENT** (déploiement final sur accord de Gradi).
- La démo préview pour les sœurs est ABANDONNÉE (décision Gradi 03/09 —
  inutile de toucher à Vercel Authentication). Compression vidéo hero :
  reportée (« on ne touche pas à la vidéo »).

## ✅ État du site — tout est en prod et fonctionne

| Élément | État |
|---|---|
| Production | ✅ **https://maisonkanali.fr** (HTTPS, redirections 308 depuis www et maison-kanali.vercel.app) |
| Dernier déploiement | ✅ 29/08 — dépose cils **20 € prix normal** (commit `40f7f1f`), vérifié en prod le 30/08 |
| Réservation en ligne | ✅ Wizard 4 étapes, anti-chevauchement testé (409), créneaux 10h–18h (une prestation doit *finir* à 18h) |
| Emails | ✅ Notification maison + ticket cliente (PDF A5 + invitation .ics) via Gmail `gradipalaba28@gmail.com`, reply-to maisonkanali@gmail.com |
| Promo cils | ✅ Les 4 poses à 40 € jusqu'au 31/10 (expiration automatique) ; la dépose est HORS promo (20 € définitif) |
| Base | ✅ Supabase `aatzhqzntpzubkvnriop` (eu-west-3, gratuit) + cron Vercel 6h UTC → `/api/health` (anti-pause) |
| Domaine | ✅ maisonkanali.fr chez LWS (compte LWS-822560), expire 21/08/2027, renouvellement auto |
| Sécurité | ✅ CSP/HSTS, rate limiting, anti-CSRF, honeypots, lockdown 3 étages (`SECURITY_LOCKDOWN`), RLS sans policy anonyme |
| Code | ✅ github.com/ctrl-grxce/Maison-Kaneli · local `C:\Users\gradi\maison-kanali` — tout est commité/pushé |

## 📋 À faire

### ① Finalisation (EN COURS)

- [ ] **Paiement / acomptes** → voir chantier détaillé ci-dessous
- [ ] Retouches design (liste à préciser par Gradi)
- [x] **Gestion des rendez-vous pour Kandy & Nafi — CODÉE le 03/09** → voir chantier ci-dessous
- [ ] (reporté par Gradi) Compresser `public/videos/hero.mp4` 11 MB → ~3 MB (ffmpeg-static dans le scratchpad, comme le 04/08)

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

### ③ Référencement (après ②)

- [ ] Search Console : propriété Domaine (TXT chez LWS — Gradi sait éditer la zone) ou hook `GOOGLE_SITE_VERIFICATION` déjà dans le code
- [ ] Bing et autres moteurs
- [ ] Optionnel : `alternates.canonical` dans le metadata (les 308 compensent déjà)

### 📆 Rappels datés

- **Début novembre 2026** : retirer À LA MAIN la bannière « Toutes les poses à 40 € » sur `/naftali` (les prix, eux, expirent tout seuls le 31/10) + nettoyer les champs `promo` morts dans `lib/services.ts`
- **21/08/2027** : renouvellement auto du domaine chez LWS — vérifier le moyen de paiement

### 🧹 Fond de tiroir (quand Gradi veut)

- Mettre maisonkanali.fr dans les bios Instagram (@kandylovebeauty / @naf.lashes) + prévenir Kandy & Nafi
- Gmail : recréer le mot de passe d'application SUR maisonkanali@gmail.com puis rebasculer `GMAIL_USER` sur Vercel
- `fondatrices.jpg` est encore une image IA → vraie photo des deux sœurs un jour
- Renommer le repo GitHub `Maison-Kaneli` → `Maison-Kanali` (optionnel)

## 📖 Journal de progression

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
- Horaires : lundi–samedi, 10h–18h, sur rendez-vous uniquement.
- Réservations : pas de 30 min, 90 min de délai minimum le jour même, horizon 60 jours, heure de Paris.
