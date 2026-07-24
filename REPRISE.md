# 📌 Maison Kanali — Point de reprise

*Mis à jour le 24 juillet 2026. Ouvre ce fichier (ou dis « on reprend Maison
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
| Emails automatiques | ⏳ Code prêt — **il manque la clé Resend + l'email de Kanali** |
| Vercel | Compte gradipalaba28 · projet `maison-kanali` — variables `SUPABASE_URL`/`SUPABASE_KEY` (Sensitive) ajoutées le 24/07 |

## ✋ À faire à la reprise (dans l'ordre)

1. **Ménage optionnel sur Vercel** : les anciennes variables
   `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` peuvent être
   supprimées (Dashboard → Settings → Environment Variables) — le site
   utilise désormais `SUPABASE_URL`/`SUPABASE_KEY`, déployé et vérifié le
   24/07. ⚠️ Ne jamais ajouter une variable Vercel via un pipe PowerShell
   (ça insère un BOM invisible qui casse l'API) — passer par le dashboard ou
   `printf` sous Git Bash.
2. **Activer les emails** : compte gratuit sur resend.com → API Key, puis dans
   Vercel → Settings → Environment Variables : `RESEND_API_KEY` +
   `BOOKING_EMAIL_TO` (l'adresse qui reçoit les rendez-vous) → Redeploy.
3. **Tarifs manquants** (fichier [lib/services.ts](lib/services.ts)) :
   cils Naftali (cil à cil, mixte, volume russe, remplissage, dépose),
   nail art, entretien & dépose — actuellement « Sur demande ».
4. **Coordonnées réelles** ([lib/config.ts](lib/config.ts)) : adresse exacte du
   showroom, téléphone, vrai email de contact.
5. **Photo maquillage** : la carte maquillage utilise encore un visuel IA
   (`public/images/carte-maquillage.jpg`) — à remplacer quand Kandy enverra
   une vraie photo. Idem `fondatrices.jpg` (portrait des deux fondatrices).
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

- **UNE maison, deux pôles** (pas « deux maisons sœurs ») : **Viminde Kandy**
  (fondatrice, CEO Kandylove Beauty, pôle beauté — ongles & maquillage, 8+ ans
  de métier, 5 diplômes, mentore : Romina Chiriac) et **Viminde Nafi**
  (co-fondatrice, associée stratégique, CEO Naftali, pôle regard — cils).
  Ensemble : « un lieu où l'exigence rencontre la douceur ».
- Horaires : lundi–samedi, 10h–17h — sur rendez-vous uniquement.
- Réservations : pas de 30 min, 90 min de délai le jour même, horizon 60 jours
  ([lib/config.ts](lib/config.ts)) — calendrier calé sur l'heure de Paris.
- Photos : les réalisations sont dans `public/images/realisation-*.jpg`,
  élèves dans `eleve-*.jpg`, cils dans `cils-*.jpg`, formation dans
  `formation-kandy.jpg`.
