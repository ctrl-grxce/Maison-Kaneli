import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT } from "@/lib/config";

export const metadata: Metadata = {
  title: "Politique de confidentialité & cookies",
  robots: { index: false },
};

const UPDATED = "4 août 2026";

const SECTIONS = [
  {
    title: "Qui est responsable de vos données ?",
    body: [
      `Maison Kanali — showroom beauté & centre de formation à ${CONTACT.city} (${CONTACT.region}) — est responsable du traitement des données collectées sur ce site.`,
      "Pour toute question relative à vos données, vous pouvez contacter la maison via ses comptes Instagram (@kandylovebeauty, @naf.lashes) ou en réponse à l'email de confirmation de votre rendez-vous.",
    ],
  },
  {
    title: "Quelles données collectons-nous ?",
    body: [
      "Lors d'une réservation ou d'une demande de formation, nous collectons uniquement les informations que vous saisissez : prénom, nom, adresse email, numéro de téléphone, prestation ou formation choisie, date et heure souhaitées, et vos éventuelles précisions libres.",
      "Aucune donnée de paiement n'est collectée sur ce site : le règlement s'effectue sur place, au showroom.",
      "Comme tout hébergeur, notre prestataire technique conserve des journaux de connexion minimaux (adresse IP, horodatage) à des fins de sécurité.",
    ],
  },
  {
    title: "Pourquoi et sur quelle base ?",
    body: [
      "Vos données servent exclusivement à la gestion de vos rendez-vous et demandes de formation : vérification des disponibilités, enregistrement de la réservation et, lorsque ce service est actif, envoi d'un email de confirmation. Ce traitement repose sur l'exécution de mesures précontractuelles et contractuelles (article 6.1.b du RGPD).",
      "La protection du site contre les abus (tentatives d'intrusion, robots) repose sur notre intérêt légitime (article 6.1.f du RGPD).",
      "Vos données ne sont jamais utilisées à des fins publicitaires, ni cédées, ni vendues à des tiers.",
    ],
  },
  {
    title: "Où sont hébergées vos données ?",
    body: [
      "Les réservations sont enregistrées dans une base de données Supabase hébergée à Paris (région AWS eu-west-3, Union européenne).",
      "Le site est édité via Vercel Inc. (États-Unis) ; ses fonctions serveur qui traitent vos réservations sont exécutées dans la région de Paris. Les transferts éventuels vers des prestataires établis aux États-Unis sont encadrés par les mécanismes prévus par le RGPD (clauses contractuelles types, Data Privacy Framework).",
      "L'envoi des emails de confirmation, lorsqu'il est actif, est assuré par le prestataire Resend.",
    ],
  },
  {
    title: "Combien de temps sont-elles conservées ?",
    body: [
      "Les données liées à vos rendez-vous et demandes de formation sont conservées au maximum 3 ans après votre dernier contact avec Maison Kanali, sauf obligation légale imposant une durée différente. Au-delà, elles sont supprimées.",
    ],
  },
  {
    title: "Quels sont vos droits ?",
    body: [
      "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données. Pour l'exercer, contactez Maison Kanali par les moyens indiqués plus haut : la demande est traitée dans un délai d'un mois.",
      "Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (Commission nationale de l'informatique et des libertés) — cnil.fr.",
    ],
  },
  {
    title: "Cookies et traceurs",
    body: [
      "Ce site ne dépose aucun cookie : pas de cookie publicitaire, pas de traceur de mesure d'audience, pas de réseau social embarqué. C'est pourquoi aucune bannière de consentement ne vous est présentée — elle n'a pas lieu d'être.",
      "Si des outils nécessitant des cookies devaient être ajoutés un jour, cette politique serait mise à jour et votre consentement serait recueilli au préalable lorsque la réglementation l'exige.",
    ],
  },
  {
    title: "Mise à jour de cette politique",
    body: [
      `Cette politique peut évoluer avec le site. Dernière mise à jour : ${UPDATED}.`,
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        overline="Vos données"
        title={
          <>
            Confidentialité <em className="text-bronze">&amp; cookies</em>
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
