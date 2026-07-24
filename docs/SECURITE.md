# 🛡️ Sécurité de Maison Kanali — mode d'emploi

*Ce document décrit toute la protection du site et, surtout, **quoi faire en cas
d'attaque**. Garde-le sous la main.*

> ⚖️ **Rappel important.** Ce dispositif est **100 % défensif**. Il piège,
> détecte, alerte et verrouille — il **n'attaque jamais** la machine d'un
> intrus. Riposter (virus, sabotage) est un délit dont c'est **le propriétaire
> du site** qui répond, et les attaquants passent par des machines de victimes
> innocentes. La vraie force, c'est de rendre tes données **inatteignables**,
> pas de contre-attaquer.

---

## Les couches de protection (défense en profondeur)

Une donnée doit traverser **plusieurs murs** avant d'être atteinte. Ici il y en
a quatre, indépendants :

| # | Mur | Ce qu'il fait |
|---|-----|----------------|
| 1 | **Bordure (Edge)** | En-têtes stricts (CSP, HSTS, anti-iframe…), leurres/honeypots, détection de sondes d'attaque, contrôle d'origine (anti-CSRF), rate limiting par IP |
| 2 | **Application** | Validation stricte (Zod), champ-piège anti-robots, aucune clé dans le navigateur, secret de garde sur la route interne |
| 3 | **Base de données** | RLS **sans aucune policy publique** + fonctions RPC `security definer` : le navigateur ne parle jamais aux tables, uniquement à des fonctions cadrées |
| 4 | **Au repos** | Chiffrement Supabase, clé « publishable » restreinte, sauvegardes |

---

## 🎣 Les leurres (honeypots)

Des chemins qui n'existent pas vraiment mais qu'un attaquant teste toujours en
premier : `/.env`, `/admin`, `/wp-login.php`, `/api/admin/export`,
`/phpmyadmin`, `/backup.sql`… (liste dans [lib/honeypots.ts](../lib/honeypots.ts)).

Quand l'un d'eux est touché :

1. L'intrus reçoit un **décor factice crédible** — un faux `.env`, une fausse
   page de connexion admin, un faux export de clientes. **Tout est bidon** :
   les « clés » sont des *honeytokens* qui ne mènent nulle part, les fausses
   clientes n'existent pas. Il perd son temps sur du vide.
2. La tentative est **journalisée** (visible dans les logs Vercel) et **une
   alerte email** t'est envoyée (dès que Resend est configuré).
3. Le compteur de menaces monte → le **cadenas peut s'enclencher tout seul**.

> Le « petit cadeau » que tu voulais mettre dans les fausses données, c'est
> exactement ça : le *honeytoken*. Inoffensif pour l'attaquant, mais s'il tente
> un jour de s'en servir, ça ne marche pas — et toi, tu sais qu'on t'a visé.

---

## 🔒 Le cadenas d'urgence à 3 étages

Piloté par la variable d'environnement **`SECURITY_LOCKDOWN`** (ton
interrupteur) **et** par une escalade automatique si les attaques se
multiplient. Le niveau réel est toujours **le plus strict des deux**.

| Étage | Valeur | Effet |
|-------|--------|-------|
| **Vigilance** | `1` | Le rate limit se durcit fortement (×3). Le site fonctionne normalement pour les vraies clientes. |
| **Verrou écritures** | `2` | **Plus aucune nouvelle réservation ni demande n'entre en base** (`503`). La consultation reste possible. |
| **Cadenas total** | `3` | **Tout accès aux données est bloqué** (`503`). Le temps de sécuriser et faire tourner les clés. |

**Escalade automatique** (par instance serveur, fenêtre de 5 min) : 5 menaces →
étage 1, 15 → étage 2, 40 → étage 3. Retour au calme après 15 min sans menace.

### Déclencher le cadenas à la main

```bash
# Sur Vercel (recommandé) :
#   Dashboard → maison-kanali → Settings → Environment Variables
#   SECURITY_LOCKDOWN = 3   (Production)   puis Redeploy
# En ligne de commande (Git Bash) :
printf '%s' '3' | npx vercel env add SECURITY_LOCKDOWN production --force
npx vercel deploy --prod --yes
```

Pour lever le cadenas : remettre `SECURITY_LOCKDOWN` à `0` et redéployer.

> ℹ️ Sur Vercel, un changement de variable ne prend effet **qu'après un
> redéploiement**. C'est quasi instantané (~1 min) et voulu : personne ne peut
> modifier ce réglage sans passer par ton compte.

---

## 🚨 En cas d'attaque — la marche à suivre

1. **Cadenasse** : `SECURITY_LOCKDOWN=3` + redeploy (voir ci-dessus). Les
   données ne sortent plus.
2. **Fais tourner les clés** (rend inutile tout ce que l'intrus aurait pu voir) :
   - **Supabase** → Dashboard → Project Settings → API → *Roll* la clé
     `publishable`/`anon`. Mets la nouvelle dans `SUPABASE_KEY` sur Vercel.
   - **Report** : régénère `SECURITY_REPORT_SECRET`
     (`node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`).
   - **Resend** : révoque et recrée `RESEND_API_KEY` si elle a pu fuiter.
3. **Sauvegarde et mets à l'abri les données** (le « vidés et gardés quelque
   part ») :
   - Supabase → Dashboard → Database → **Backups** (restauration à un instant T).
   - Export manuel : Dashboard → Table Editor → `bookings` / `formation_requests`
     → *Export CSV*. Range le fichier dans un endroit sûr **à toi**.
4. **Analyse** : Vercel → Logs, cherche `[securite]` pour voir chemins visés,
   IP et horodatage. Repère l'IP fautive.
5. **Rouvre** quand c'est propre : `SECURITY_LOCKDOWN=0` + redeploy.

---

## Variables d'environnement liées à la sécurité

| Variable | Rôle |
|----------|------|
| `SUPABASE_URL` / `SUPABASE_KEY` | Accès base — **serveur uniquement**, jamais dans le navigateur |
| `SECURITY_LOCKDOWN` | Cadenas manuel : `0`/`1`/`2`/`3` |
| `SECURITY_REPORT_SECRET` | Secret de garde de `/api/security/report` |
| `SECURITY_ALERT_TO` | Adresse qui reçoit les alertes (sinon `BOOKING_EMAIL_TO`) |
| `RESEND_API_KEY` | Nécessaire pour recevoir les alertes par email |

---

## Bonne hygiène (à faire quand tu peux)

- **Active les sauvegardes** Supabase et fais un export CSV de temps en temps.
- **Configure Resend** (`RESEND_API_KEY` + `SECURITY_ALERT_TO`) pour être
  prévenu en temps réel.
- **Ne mets jamais** une variable Vercel via un *pipe PowerShell* (ça insère un
  caractère invisible qui casse tout) — passe par le dashboard ou `printf` sous
  Git Bash.
- **Ne commite jamais** un vrai secret : `.env.local` est ignoré par git,
  `.env.example` ne contient que des champs vides.
