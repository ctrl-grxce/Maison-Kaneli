# Nom de domaine — marche à suivre

> ✅ **FAIT le 24-25/08/2026 : le site est en ligne sur
> `https://maisonkanali.fr`.** Domaine acheté chez LWS le 23/08/2026
> (compte LWS-822560, expire le 21-08-2027, renouvellement auto).
> Zone DNS gérée au panel.lws.fr : `A @ → 216.198.79.1` + `A @ → 64.29.17.1`
> (valeurs exigées par `vercel domains verify`, PAS le 76.76.21.21 du §3),
> AAAA supprimé, enregistrements mail (MX/SPF/DKIM) conservés.
> `NEXT_PUBLIC_SITE_URL=https://maisonkanali.fr` posée en prod + redéploiement.
> Redirections 308 : `www.maisonkanali.fr` et `maison-kanali.vercel.app` →
> `maisonkanali.fr` (dashboard Vercel → Settings → Domains).
> **Reste à faire (§5)** : Search Console, bios Instagram/Facebook,
> domaine dans les mentions légales.
>
> — Ancien état au 23/08/2026 : site sur `maison-kanali.vercel.app`, aucun
> domaine acheté ; tout ce qui suit était la marche à suivre prévue.

## 1. Choisir le domaine

| Domaine | Où l'acheter | Prix indicatif | Remarque |
|---|---|---|---|
| **maisonkanali.fr** (recommandé) | LWS, OVH, IONOS, Gandi… (registrar français) | ≈ 5 – 8 € HT / an (LWS : 4,99 € la 1re année) | **Vercel ne vend pas de .fr** → DNS à pointer à la main (5 min, voir §3). Le plus rassurant pour une clientèle française. |
| maisonkanali.com | Directement dans Vercel | 11,25 $ / an | Zéro réglage DNS, tout est automatique. Bien aussi en **second domaine** (redirigé vers le .fr) pour sécuriser le nom. |
| maisonkanali.beauty | Vercel | 1,99 $ la 1re année | Renouvellement nettement plus cher ; moins lisible à l'oral. Déconseillé en principal. |

Recommandation : **maisonkanali.fr en principal**, et si le budget le permet
**maisonkanali.com en plus** (simple redirection) pour que personne ne le prenne.

## 2. Acheter (à faire par Gradi — paiement)

- **Chez LWS / OVH (.fr)** : panier → *décocher tous les upsells* (hébergement
  web, boîte mail pro, certificat SSL payant, protection « premium »…). Le site
  est hébergé par Vercel et le HTTPS est fourni gratuitement par Vercel.
  Renseigner les coordonnées de Maison Kanali comme titulaire (et non Gald Corp)
  pour que le domaine appartienne bien à la cliente.
- **Chez Vercel (.com)** : dashboard → *Domains* → *Buy* → `maisonkanali.com`,
  ou en ligne de commande : `npx vercel domains buy maisonkanali.com`.

## 3. Brancher le domaine sur le projet Vercel

### A. Domaine acheté ailleurs (cas du .fr)

1. Ajouter le domaine au projet :
   ```bash
   npx vercel domains add maisonkanali.fr
   npx vercel domains add www.maisonkanali.fr
   ```
   (ou dashboard Vercel → projet *maison-kanali* → *Settings* → *Domains* → *Add*).
   Laisser Vercel configurer « www → redirige vers maisonkanali.fr ».
2. Chez le registrar, dans la **zone DNS** du domaine, créer :

   | Type | Nom | Valeur |
   |---|---|---|
   | A | `@` (racine) | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

   ⚠️ Vercel affiche les valeurs exactes attendues dans l'onglet *Domains* du
   projet (elles peuvent différer légèrement, ex. `216.198.79.1`) : **toujours
   recopier celles de l'écran Vercel**. Supprimer les éventuels A/CNAME par défaut
   posés par le registrar (page « parking »).

   *Alternative* : remplacer les serveurs DNS du domaine par ceux de Vercel
   (`ns1.vercel-dns.com` / `ns2.vercel-dns.com`). Plus simple, mais toute la zone
   DNS (y compris de futurs emails @maisonkanali.fr) devra alors être gérée
   chez Vercel.
3. Vérifier : `npx vercel domains inspect maisonkanali.fr` — jusqu'à 24 h de
   propagation (en général quelques minutes). Le certificat HTTPS est émis
   automatiquement.

### B. Domaine acheté chez Vercel (cas du .com)

Assigner le domaine au projet *maison-kanali* (proposé à l'achat) : DNS et HTTPS
sont réglés tout seuls.

## 4. Mettre le site à jour (une variable + un redéploiement)

1. Vercel → projet → *Settings* → *Environment Variables* → **Production** :
   `NEXT_PUBLIC_SITE_URL = https://maisonkanali.fr` (sans slash final).
   Depuis le terminal : `npx vercel env add NEXT_PUBLIC_SITE_URL production`
   puis coller la valeur (⚠️ jamais via un pipe PowerShell : BOM invisible).
2. Redéployer : `npx vercel deploy --prod --yes`.
   → sitemap.xml, robots.txt, JSON-LD, Open Graph et liens absolus pointent
   alors sur le nouveau domaine. L'ancienne adresse `maison-kanali.vercel.app`
   continue de fonctionner et redirige vers le domaine principal.

## 5. Après la bascule

- **Google Search Console** : ajouter une propriété de type *Domaine*
  (`maisonkanali.fr`, vérification par enregistrement TXT chez le registrar) —
  elle couvre http/https et www d'un coup. Soumettre
  `https://maisonkanali.fr/sitemap.xml`.
- **Instagram** (@kandylovebeauty, @naf.lashes) et Facebook : mettre le nouveau
  lien en bio.
- **Mentions légales** : indiquer le nom de domaine et l'éditeur (Maison Kanali).
- **Emails** (option, plus tard) : avec un domaine vérifié, Resend pourra envoyer
  depuis `rendezvous@maisonkanali.fr` — il faudra ajouter les enregistrements
  DKIM/SPF donnés par Resend dans la zone DNS. Ne rien faire tant que le
  transport Gmail convient.

## Résumé express

1. Acheter `maisonkanali.fr` (LWS/OVH, upsells décochés).
2. `npx vercel domains add maisonkanali.fr` + `www.` — recopier les DNS affichés.
3. Chez le registrar : A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`.
4. `NEXT_PUBLIC_SITE_URL=https://maisonkanali.fr` sur Vercel + `npx vercel deploy --prod --yes`.
5. Search Console + bios Instagram.
