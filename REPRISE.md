# 📌 Maison Kanali — Point de reprise

*Mis à jour le 16 août 2026. Ouvre ce fichier (ou dis « on reprend Maison
Kanali ») pour repartir exactement d'ici.*

## Où en est le projet

| Élément | État |
|---|---|
| Site en production | ✅ https://maison-kanali.vercel.app — version du 24/07 déployée et vérifiée (API testée en prod) |
| Code source | ✅ https://github.com/ctrl-grxce/Maison-Kaneli (dossier local : `C:\Users\gradi\maison-kanali`) |
| Base de données | ✅ Supabase `maison-kanali` (eu-west-3, gratuit) — tables `bookings` + `formation_requests`, anti-chevauchement testé |
| Réservation en ligne | ✅ Testée de bout en bout — incohérences corrigées le 24/07 (bug créneau pris, fuseau Paris, validation téléphone…) |
| Photos réelles | ✅ 11 photos intégrées le 24/07 (galerie, Kandylove, Naftali, Formations, À propos) |
| Hero d'accueil | ✅ Film de marque unique (vidéo IA générée depuis la photo des ongles bruns, Seedance 2.0) avec fondu crème desktop/mobile — `public/videos/hero.mp4` + poster |
| Inscription formations | ✅ Formulaire d'inscription en 3 étapes directement sur /formations (POST /api/formations) |
| Parcours de Kandy | ✅ Texte intégré sur la page À propos (5 diplômes, mentore Romina Chiriac) |
| Sécurité | ✅ Renforcée le 24/07 : clés hors du code, en-têtes CSP/HSTS, rate limiting, anti-CSRF |
| Emails automatiques | ✅ **Fonctionnels depuis le 16/08 au soir** (testés en prod) : notification détaillée → maisonkanali@gmail.com + ticket cliente avec invitation .ics. Envoi via Gmail `gradipalaba28@gmail.com` (mot de passe d'application) ; les réponses des clientes arrivent chez maisonkanali (reply-to). Pour passer l'expéditeur sur maisonkanali@gmail.com plus tard : créer un mot de passe d'application SUR CE compte, remplacer `GMAIL_APP_PASSWORD` et `GMAIL_USER` sur Vercel, redéployer |
| Promo cils 40 € | ✅ Partout (dépose comprise), expiration automatique le 31/10 — la bannière `/naftali` reste à retirer à la main début novembre |
| Anti-pause Supabase | ✅ Cron Vercel quotidien 6h UTC → `/api/health` (le projet gratuit ne se suspend plus ; il s'était mis en pause le 16/08, restauré) |
| Décision créneaux en attente | ❓ Kandy & Nafi doivent trancher : dernière cliente *sort* à 17h (règle actuelle) ou *arrive* jusqu'à 17h — réglage `lib/config.ts`/`lib/availability.ts` |
| Vercel | Compte gradipalaba28 · projet `maison-kanali` — variables `SUPABASE_URL`/`SUPABASE_KEY` (Sensitive) ajoutées le 24/07 |

## ✋ À faire à la reprise (dans l'ordre)

1. **Commit + push** : les changements du 16/08 sont déployés en prod mais pas
   encore poussés sur GitHub (`git add -A && git commit && git push`).
2. **Emails : rien à faire, ils marchent** (testé 16/08 : ticket reçu en
   inbox, zéro erreur dans les logs). Expéditeur temporaire =
   gradipalaba28@gmail.com ; l'idéal un jour : recréer le mot de passe
   d'application sur maisonkanali@gmail.com et remettre `GMAIL_USER` dessus.
   ⚠️ Jamais de pipe PowerShell vers `vercel env add` (BOM) — dashboard ou
   `printf` Git Bash.
3. **Tarifs** ([lib/services.ts](lib/services.ts)) : carte ongles à jour
   (août 2026). Cils : promo 40 € sur les 5 prestations (dépose comprise,
   décision du 16/08), **expiration automatique le 31/10** (`endsOn`) — début
   novembre il restera à (a) retirer la bannière promo codée en dur sur
   [app/naftali/page.tsx](app/naftali/page.tsx) (section « Offre spéciale »
   + textes), (b) mettre les vrais tarifs cils ou laisser « Sur demande »,
   (c) supprimer les champs `promo` devenus morts.
4. **Coordonnées réelles** ([lib/config.ts](lib/config.ts)) : adresse exacte du
   showroom, téléphone, vrai email de contact.
   NB 16/08 : libellé « Naftali · by Maison Kanali » simplifié en « Naftali »
   partout (onglet réservation, récapitulatifs, emails) ; photo calligraphie
   de la section rituel remplacée par `naftali-regard-rituel.jpg`.
5. **Photos** : les photos maquillage et cils sont désormais réelles
   (`maquillage-*.jpg`, `cils-naftali-signature.jpg`, `cils-rituel.jpg`).
   Reste un visuel IA : `fondatrices.jpg` (portrait des deux fondatrices).
6. **Phase 2 — à discuter** : espace de gestion des rendez-vous pour la maison
   (confirmer/annuler, vue agenda) puis **système d'acompte** (paiement en
   ligne). La base est déjà structurée pour ça (statuts `pending/confirmed/
   cancelled`).

## Commandes utiles

```powershell
cd C:\Users\gradi\maison-kanali
npm run dev          # site en local sur http://localhost:3000
npm run build        # vérifier que tout compile
git push             # publier sur GitHub
npx vercel deploy --prod --yes   # déployer en production
```

## Sécurité (mise en place le 24/07)

- Clés Supabase **uniquement** en variables d'environnement serveur
  (`SUPABASE_URL`, `SUPABASE_KEY`) — plus rien en dur dans le code, rien dans
  le bundle navigateur (vérifié dans `.next/static`).
- En-têtes : CSP stricte, X-Frame-Options DENY, HSTS 2 ans, nosniff,
  Referrer-Policy, Permissions-Policy ([next.config.ts](next.config.ts)).
- API : rate limiting par IP + contrôle d'origine anti-CSRF
  ([lib/rate-limit.ts](lib/rate-limit.ts)).
- Base : RLS sans policy publique + RPC `security definer` (inchangé).

## Rappels de contenu (validés les 21–24/07)

- **UNE maison, deux pôles.** ⚠️ Structure validée par Nafi le 24/07, à ne
  plus jamais se tromper : **les DEUX sont co-fondatrices de Maison Kanali**
  (elles l'ont créée ensemble) ; **chacune est fondatrice de sa PROPRE
  marque** — Viminde Kandy → Kandylove Beauty (pôle beauté : ongles &
  maquillage, 8+ ans, 5 diplômes, mentore Romina Chiriac), Viminde Nafi →
  Naftali (pôle regard : cils). Ce ne sont PAS deux entreprises différentes.
  Ne pas dire « associée stratégique » ni présenter Kandy comme LA seule
  fondatrice. Instagram : @kandylovebeauty et **@naf.lashes**.
- Horaires : lundi–samedi, 10h–17h — sur rendez-vous uniquement.
- Réservations : pas de 30 min, 90 min de délai le jour même, horizon 60 jours
  ([lib/config.ts](lib/config.ts)) — calendrier calé sur l'heure de Paris.
- Photos : les réalisations sont dans `public/images/realisation-*.jpg`,
  élèves dans `eleve-*.jpg`, cils dans `cils-*.jpg`, formation dans
  `formation-kandy.jpg`.
