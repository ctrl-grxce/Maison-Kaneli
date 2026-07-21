import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT } from "@/lib/config";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false },
};

const SECTIONS = [
  {
    title: "Éditeur du site",
    body: [
      `Maison Kanali — showroom beauté & centre de formation, ${CONTACT.city} (${CONTACT.region}).`,
      "Directrice de la publication : Viminde Kandy.",
      "Coordonnées complètes disponibles sur demande via la page de réservation.",
    ],
  },
  {
    title: "Hébergement",
    body: [
      "Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.",
    ],
  },
  {
    title: "Données personnelles",
    body: [
      "Les informations saisies lors d'une réservation (identité, coordonnées, prestation choisie) sont utilisées uniquement pour la gestion de vos rendez-vous par Maison Kanali. Elles ne sont ni cédées, ni vendues à des tiers.",
      "Conformément au RGPD, vous pouvez demander l'accès, la rectification ou la suppression de vos données en contactant Maison Kanali (par exemple en réponse à l'email de confirmation de votre rendez-vous).",
      "Ce site n'utilise aucun cookie de suivi publicitaire.",
    ],
  },
  {
    title: "Propriété intellectuelle",
    body: [
      "L'ensemble des contenus du site (textes, visuels, logos Maison Kanali, Kandylove Beauty et Naftali) est protégé et ne peut être reproduit sans autorisation préalable.",
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
