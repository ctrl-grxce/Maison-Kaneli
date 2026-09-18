import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { CONTACT, LEGAL, SITE } from "@/lib/config";
import { DEPOSIT_CENTS, formatEuros } from "@/lib/services";

export const metadata: Metadata = {
  title: "Conditions générales de vente",
  robots: { index: false },
};

/**
 * CGV — obligatoires dès lors qu'un acompte est encaissé en ligne
 * (docs/PAIEMENT.md). Les montants et les délais ne sont PAS écrits en dur :
 * ils sont dérivés de `lib/services.ts` et `lib/config.ts`, pour qu'une
 * modification des acomptes ne puisse jamais rendre cette page mensongère.
 *
 * Règles arrêtées par les fondatrices le 30/08/2026 (rapportées par Gradi) :
 * annulation possible jusqu'à 48 h avant le rendez-vous ; en deçà, l'acompte
 * est conservé ; toute demande de remboursement passe par l'email public.
 * Droit français, juridictions françaises (confirmé par Gradi le 18/09/2026).
 */

const UPDATED = "18 septembre 2026";

/** Délai d'annulation sans frais, en heures. Une seule source. */
const CANCEL_NOTICE_HOURS = 48;

const DOMAIN = SITE.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

const SECTIONS = [
  {
    title: "1. Objet et identité du prestataire",
    body: [
      `Les présentes conditions générales de vente (CGV) régissent les réservations de prestations effectuées sur le site ${DOMAIN} et les prestations réalisées au showroom.`,
      `Le prestataire est ${LEGAL.businessName}, ${LEGAL.legalForm}, déclarée en préfecture de l'Aisne sous le numéro RNA ${LEGAL.rna}, dont le siège est situé ${LEGAL.address} (${LEGAL.country}), immatriculée sous le SIRET ${LEGAL.siret}. ${LEGAL.vatNote}.`,
      `Toute réservation implique l'acceptation pleine et entière des présentes CGV. Contact : ${CONTACT.emailPublic}.`,
    ],
  },
  {
    title: "2. Prestations et tarifs",
    body: [
      "Les prestations proposées sont des soins esthétiques (prothésie ongulaire, maquillage, extensions de cils) et des formations professionnelles, réalisés sur rendez-vous au siège de l'association.",
      `Les tarifs sont affichés en euros sur les pages de prestations. L'association n'étant pas assujettie à la TVA, aucune taxe n'est ajoutée au prix affiché : le montant indiqué est celui que vous réglez — ${LEGAL.vatNote}.`,
      "Certaines prestations, notamment les prestations mariées, sont proposées « sur devis » : leur tarif est établi au cas par cas et ne peut pas être réservé en ligne. Les tarifs promotionnels sont valables jusqu'à la date indiquée sur la page concernée.",
      "Les tarifs applicables sont ceux affichés au moment de la réservation.",
    ],
  },
  {
    title: "3. Réservation en ligne",
    body: [
      "La réservation s'effectue en choisissant une prestation, une date et un créneau disponible, puis en renseignant vos coordonnées. Un créneau réservé n'est plus proposé aux autres clientes.",
      "Lorsque la prestation choisie donne lieu à un acompte, le créneau est retenu à titre provisoire pendant la durée du paiement. À défaut de paiement dans ce délai, la réservation est automatiquement annulée et le créneau redevient disponible, sans qu'aucune somme ne soit due.",
      "La réservation n'est définitive qu'à réception de l'email de confirmation, qui comporte votre référence de réservation, votre ticket et, le cas échéant, votre facture d'acompte.",
    ],
  },
  {
    title: "4. Acompte et paiement",
    body: [
      `Pour garantir le créneau, un acompte est demandé au moment de la réservation : ${formatEuros(DEPOSIT_CENTS.ongles)} pour les prestations d'onglerie, ${formatEuros(DEPOSIT_CENTS.maquillage)} pour le maquillage et ${formatEuros(DEPOSIT_CENTS.cils)} pour les poses de cils.`,
      "Certaines prestations ne donnent lieu à aucun acompte en ligne, notamment la dépose de cils et les prestations sur devis : elles se règlent intégralement sur place.",
      "L'acompte est déduit du prix total : le solde est réglé sur place le jour du rendez-vous, selon les moyens de paiement acceptés au showroom.",
      "Le paiement en ligne est traité par Stripe Payments Europe, Ltd. Aucune donnée de carte bancaire n'est saisie, traitée ni conservée sur ce site. Une facture d'acompte numérotée vous est adressée par email dès la confirmation du paiement.",
    ],
  },
  {
    title: "5. Annulation ou report par la cliente",
    body: [
      `Vous pouvez annuler ou demander le report de votre rendez-vous jusqu'à ${CANCEL_NOTICE_HOURS} heures avant l'heure prévue. Dans ce cas, l'acompte versé vous est remboursé, ou reporté sur un nouveau rendez-vous, à votre convenance.`,
      `Passé ce délai de ${CANCEL_NOTICE_HOURS} heures, et en cas d'absence au rendez-vous, l'acompte reste acquis à l'association : il couvre le créneau immobilisé et la préparation de la prestation.`,
      `Toute demande d'annulation, de report ou de remboursement s'effectue par email à ${CONTACT.emailPublic}, en indiquant votre référence de réservation.`,
      "Un retard important peut réduire la durée de la prestation ou, si le planning ne le permet pas, conduire à son report ; l'acompte reste alors acquis dans les conditions ci-dessus.",
    ],
  },
  {
    title: "6. Annulation par la maison",
    body: [
      "En cas d'empêchement, la maison vous propose un nouveau créneau ou vous rembourse intégralement l'acompte versé, à votre choix. Vous en êtes informée par email dans les meilleurs délais.",
      "Le remboursement est effectué sur le moyen de paiement utilisé lors de la réservation.",
    ],
  },
  {
    title: "7. Droit de rétractation",
    body: [
      "Les prestations réservées sur ce site sont des services de soins à la personne fournis à une date ou à une période déterminée. Conformément à l'article L221-28 du Code de la consommation, elles ne bénéficient pas du droit de rétractation de quatorze jours applicable à la vente à distance.",
      `Les conditions d'annulation prévues à l'article 5 — annulation libre jusqu'à ${CANCEL_NOTICE_HOURS} heures avant le rendez-vous — s'appliquent en lieu et place.`,
    ],
  },
  {
    title: "8. Déroulement de la prestation",
    body: [
      "Les prestations sont réalisées dans le respect des règles d'hygiène et de sécurité applicables. Il vous appartient de signaler toute allergie, sensibilité, traitement en cours ou état de santé particulier avant le début de la prestation.",
      "La maison se réserve la possibilité de refuser ou d'interrompre une prestation si les conditions de sécurité ou de santé ne sont pas réunies ; l'acompte est alors remboursé, sauf si l'information a été volontairement dissimulée.",
      "Les prestations de soins esthétiques n'ont pas de finalité médicale et ne constituent pas un acte de soin.",
    ],
  },
  {
    title: "9. Réclamations et médiation",
    body: [
      `Toute réclamation peut être adressée à ${CONTACT.emailPublic}. La maison s'engage à y répondre dans les meilleurs délais et à rechercher une solution amiable.`,
      `Conformément aux articles L611-1 et suivants du Code de la consommation, vous pouvez recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige, après avoir tenté de le résoudre directement auprès de la maison. Les coordonnées du médiateur compétent vous sont communiquées sur simple demande à ${CONTACT.emailPublic}.`,
      "La plateforme européenne de règlement en ligne des litiges est accessible à l'adresse ec.europa.eu/consumers/odr.",
    ],
  },
  {
    title: "10. Données personnelles",
    body: [
      "Les données communiquées lors d'une réservation sont utilisées uniquement pour la gestion de vos rendez-vous et l'émission des documents associés. Le détail des traitements, des durées de conservation et de vos droits figure dans notre politique de confidentialité, accessible depuis le pied de page.",
    ],
  },
  {
    title: "11. Droit applicable et juridiction",
    body: [
      "Les présentes CGV sont soumises au droit français.",
      "En cas de litige, une solution amiable sera recherchée en priorité. À défaut d'accord, le litige sera porté devant les tribunaux français compétents.",
    ],
  },
  {
    title: "12. Mise à jour",
    body: [
      `Ces conditions peuvent évoluer. Les conditions applicables sont celles en vigueur au jour de votre réservation. Dernière mise à jour : ${UPDATED}.`,
    ],
  },
] as const;

export default function CgvPage() {
  return (
    <>
      <PageHero
        overline="Informations"
        title={
          <>
            Conditions générales <em className="text-bronze">de vente</em>
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
