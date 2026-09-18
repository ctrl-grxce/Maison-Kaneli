import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT, LEGAL, SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false },
};

/** Domaine affiché (« maisonkanali.fr ») dérivé de l'URL publique du site. */
const DOMAIN = SITE.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const SECTIONS = [
  {
    title: "Éditeur du site",
    body: [
      `${LEGAL.businessName} — ${LEGAL.legalForm}, déclarée en préfecture de l'Aisne sous le numéro RNA ${LEGAL.rna}.`,
      `Siège social : ${LEGAL.address} (${LEGAL.country}).`,
      `SIRET : ${LEGAL.siret}. ${LEGAL.vatNote}.`,
      `Représentante légale et directrice de la publication : ${LEGAL.representative}.`,
      `Contact : ${CONTACT.emailPublic} — site officiel : ${DOMAIN}.`,
      "L'association a pour objet une activité de showroom beauté et de formation professionnelle, exercée sans but lucratif : les sommes encaissées sont affectées à son fonctionnement et à la réalisation de son objet.",
    ],
  },
  {
    title: "Activités présentées",
    body: [
      "Le site présente les prestations réalisées au showroom par ses deux pôles — Kandylove Beauty (prothésie ongulaire, maquillage) et Naftali (extensions de cils) — ainsi que les formations professionnelles proposées par la maison.",
      "Les prestations de soins esthétiques sont réalisées sur rendez-vous, exclusivement au siège indiqué ci-dessus.",
    ],
  },
  {
    title: "Hébergement",
    body: [
      "Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com. Les fonctions serveur du site sont exécutées dans la région de Paris.",
      "Les données de réservation sont stockées par Supabase, sur une infrastructure située à Paris (Union européenne).",
      "Les paiements d'acompte en ligne sont traités par Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irlande. Aucune donnée de carte bancaire ne transite par ce site ni n'y est conservée.",
    ],
  },
  {
    title: "Données personnelles & cookies",
    body: [
      "Les informations saisies lors d'une réservation (identité, coordonnées, prestation choisie) sont utilisées uniquement pour la gestion de vos rendez-vous par la maison. Elles ne sont ni cédées, ni vendues à des tiers.",
      "Ce site ne dépose aucun cookie publicitaire ni traceur de mesure d'audience, et ne présente donc pas de bannière de consentement. Seuls des cookies strictement nécessaires peuvent être déposés : par Stripe pendant le paiement sécurisé, et par l'espace de gestion réservé à la maison.",
      "Le détail complet — données collectées, durées de conservation, vos droits RGPD — figure dans notre politique de confidentialité, accessible depuis le pied de page.",
    ],
  },
  {
    title: "Conditions de vente",
    body: [
      "Les réservations en ligne, les acomptes, les conditions d'annulation et de remboursement sont régis par nos conditions générales de vente, accessibles depuis le pied de page.",
    ],
  },
  {
    title: "Propriété intellectuelle",
    body: [
      "L'ensemble des contenus du site (textes, visuels, logos Maison Kanali, Kandylove Beauty et Naftali) est protégé et ne peut être reproduit sans autorisation préalable.",
    ],
  },
  {
    title: "Droit applicable",
    body: [
      "Le présent site et les prestations qui y sont réservées sont soumis au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français sont seuls compétents.",
    ],
  },
  {
    title: "Conception & maintenance",
    body: [
      "Site conçu par Gradi Palaba, ingénieur chez Gald Corp. Maintenance assurée par Gald Corp.",
    ],
  },
] as const;

export default function LegalPage() {
  return (
    <>
      <PageHero
        overline="Informations"
        title={
          <>
            Mentions <em className="text-bronze">légales</em>
          </>
        }
      />
      <section className="mx-auto max-w-3xl px-4 py-14 md:px-8 md:py-20">
        <div className="space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-2xl font-medium">
                {section.title}
              </h2>
              <div className="hairline mt-4 w-10 bg-bronze/50" />
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 32)}
                    className="text-sm leading-relaxed text-taupe"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
