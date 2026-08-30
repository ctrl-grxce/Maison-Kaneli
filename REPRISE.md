# 📌 Maison Kanali — Suivi du projet (à faire & progression)

*Fichier de bord demandé par Gradi (29/08/2026). **Claude : lis ce fichier en
premier à chaque reprise d'une conversation sur Maison Kanali**, et mets-le à
jour à chaque avancée. Dernière mise à jour : **30/08/2026**.*

## 🚦 En ce moment

**Phase en cours : ① Finalisation du site** (plan fixé par Gradi le 29/08 :
finir la finition ce week-end, puis ② conformité, puis ③ référencement).

**Chantier actif : paiement / acomptes.** Cadrage fait le 29/08 (3 options
expliquées en profondeur, reco = Checkout Stripe hébergé + webhook), en attente
des décisions de Gradi — voir « Chantier paiement » ci-dessous.
Ensuite, dans l'ordre voulu : **retouches design** (Gradi précisera), puis
**gestion des rendez-vous** (à cadrer et faire).

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
- [ ] Gestion des rendez-vous pour Kandy & Nafi (voir/annuler/déplacer — à cadrer ensemble après le paiement ; la base est prête : statuts `pending/confirmed/cancelled`)
- [ ] Compresser `public/videos/hero.mp4` 11 MB → ~3 MB (ffmpeg-static dans le scratchpad, comme le 04/08)

### 💳 Chantier paiement (état au 30/08) — spec complète : `docs/PAIEMENT.md`

1. [x] **Cadrage** (29/08) : 3 architectures expliquées. Reco = **option A : Checkout Stripe hébergé + webhook** — résa `awaiting_payment` qui bloque le créneau 30 min → page de paiement chez Stripe → webhook signé → résa confirmée + emails ; pas payé en 30 min → créneau libéré. (Option B Payment Links : rejetée pour les résas, utile plus tard pour les formations. Option C formulaire intégré : trop de code pour rien.)
2. [x] **Architecture VALIDÉE par Gradi (30/08)** : option A — Checkout Stripe hébergé + webhook
3. [x] **Montants décidés par Gradi (30/08)** : acompte **20 € ongles** · **30 € maquillage** (hors prestations mariées → sur devis, Gradi reviendra plus tard là-dessus) · **20 € poses de cils** · **dépose = SANS acompte** (20 € payés sur place, circuit actuel inchangé)
3b. [x] **Règles fixées par Gradi (30/08)** : ① AUCUN email (ni à la maison ni à la cliente) tant que l'acompte n'est pas payé — les emails partent uniquement quand le paiement est confirmé ; ② joindre en plus une **facture d'acompte PDF** au ticket et au fichier agenda ; ③ toujours écrire « réservation », jamais « résa » ; ④ remis à plus tard : retards & remboursements, prestations mariées (sur devis).
4. [ ] **Compte Stripe en mode test** — Gradi le crée (gratuit, pas besoin de SIRET/IBAN en test) et colle les clés dans Vercel lui-même (Claude ne manipule jamais les secrets)
5. [ ] **Implémentation** derrière l'interrupteur `PAYMENTS_ENABLED` (éteint = site actuel intact) : statut + expiration en base, route création de session Checkout, route `/api/stripe/webhook`, aiguillage emails (« acompte réglé X € · reste Y € sur place »)
6. [ ] **Tests en mode test** (carte `4242 4242 4242 4242`) sur un déploiement de préview Vercel — jamais directement en prod
7. [ ] **Plus tard, pour allumer en vrai** (décision Gradi) : compte Stripe officiel de la maison (SIRET/IBAN de Kandy & Nafi), clés réelles, CGV (→ conformité), et sans doute Vercel Pro 20 $/m + Supabase Pro 25 $/m

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
