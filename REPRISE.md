# 📌 Maison Kanali — Point de reprise

*Mis à jour le 22 juillet 2026. Ouvre ce fichier (ou dis « on reprend Maison
Kanali ») pour repartir exactement d'ici.*

## Où en est le projet

| Élément | État |
|---|---|
| Site en production | ✅ https://maison-kanali.vercel.app |
| Code source | ✅ https://github.com/ctrl-grxce/Maison-Kaneli (dossier local : `C:\Users\gradi\maison-kanali`) |
| Base de données | ✅ Supabase `maison-kanali` (eu-west-3, gratuit) — tables `bookings` + `formation_requests`, anti-chevauchement testé |
| Réservation en ligne | ✅ Testée de bout en bout (prestation → créneau → confirmation) |
| Menu mobile | ✅ Corrigé (bug d'affichage du 21/07 réglé via portail React) |
| Emails automatiques | ⏳ Code prêt — **il manque la clé Resend + l'email de Kanali** |
| Vercel | Compte gradipalaba28 · projet `maison-kanali` |

## ✋ À faire à la reprise (dans l'ordre)

1. **Activer les emails** : compte gratuit sur resend.com → API Key, puis dans
   Vercel → Settings → Environment Variables : `RESEND_API_KEY` +
   `BOOKING_EMAIL_TO` (l'adresse qui reçoit les rendez-vous) → Redeploy.
2. **Tarifs manquants** (fichier [lib/services.ts](lib/services.ts)) :
   cils Naftali (cil à cil, mixte, volume russe, remplissage, dépose),
   nail art, entretien & dépose — actuellement « Sur demande ».
3. **Coordonnées réelles** ([lib/config.ts](lib/config.ts)) : adresse exacte du
   showroom, téléphone, vrai email de contact (les mentions légales et la page
   À propos affichent des libellés génériques en attendant).
4. **Photos réelles** : remplacer/compléter les visuels IA par des photos des
   réalisations Kandylove & Naftali quand elles seront disponibles
   (`public/images/`).
5. **Phase 2 — à discuter** : espace de gestion des rendez-vous pour la maison
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

## Rappels de contenu (validés le 21–22/07)

- Deux professionnelles, chacune CEO de sa maison : **Viminde Kandy**
  (fondatrice, responsable du pôle beauté, CEO Kandylove Beauty, 8+ ans de
  métier) et **Viminde Nafi** (co-fondatrice, associée stratégique, CEO
  Naftali). Ensemble : « un lieu où l'exigence rencontre la douceur ».
- Horaires : lundi–samedi, 10h–17h — sur rendez-vous uniquement.
- Réservations : pas de 30 min, 90 min de délai le jour même, horizon 60 jours
  ([lib/config.ts](lib/config.ts)).
