import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getService, servicesByCategory } from "@/lib/services";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceMenu } from "@/components/ui/ServiceMenu";
import { Reveal } from "@/components/ui/Reveal";
import { MobileBookBar } from "@/components/layout/MobileBookBar";
import { CtaBand } from "@/components/home/CtaBand";
import { ArrowRightIcon, SparkleIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Kandylove Beauty — Onglerie & Maquillage",
  description:
    "Prothésie ongulaire (pose gel, remplissage, nail art) et maquillage professionnel (mariée, naturel, full face) par Kandylove Beauty, le pôle beauté de Maison Kanali à Saint-Quentin.",
};

/* Regroupement du maquillage — même logique que le flyer TARIF. */
const MAQUILLAGE_GROUPES = [
  { label: "Mariée", ids: ["mariee-essai", "mariee-jour-j"] },
  { label: "Maquillage naturel", ids: ["naturel-basic", "naturel-liner", "classic-yeux"] },
  { label: "Full face", ids: ["full-teint-levres", "full-yeux-charges", "shooting"] },
] as const;

const CHIP_CLASS =
  "inline-flex h-10 items-center rounded-full border border-bronze/40 bg-white/80 px-5 text-[0.66rem] tracking-[0.18em] text-bronze uppercase transition-colors duration-300 hover:bg-bronze hover:text-ivory";

export default function KandylovePage() {
  return (
    <>
      <PageHero
        overline="Le pôle beauté · depuis plus de 8 ans"
        title={
          <>
            Kandylove <em className="text-bronze">Beauty</em>
          </>
        }
        intro="Des mains impeccables, un teint sublimé : le pôle beauté de Maison Kanali, dirigé par Viminde Kandy, cultive l'art de la prothésie ongulaire et du maquillage professionnel."
      >
        <div className="mt-8 flex flex-wrap justify-center gap-2.5">
          <a href="#onglerie" className={CHIP_CLASS}>
            Prothésie ongulaire
          </a>
          <a href="#maquillage" className={CHIP_CLASS}>
            Maquillage
          </a>
        </div>
      </PageHero>

      {/* ── Onglerie ─────────────────────────────────────────────────────── */}
      <section id="onglerie" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:px-8 md:py-20">
          <div>
            <SectionHeading
              overline="Prothésie ongulaire"
              title={
                <>
                  Des ongles <em className="text-bronze">d'exception</em>
                </>
              }
              intro="Pose en gel, remplissage, nail art : chaque geste est précis, chaque finition est pensée pour durer."
            />
            <Reveal delay={150}>
              <div className="arch relative mt-10 hidden aspect-[4/5] max-w-[19rem] border border-sand-deep/60 md:block">
                <Image
                  src="/images/carte-ongles.jpg"
                  alt="Pose gel — Kandylove Beauty"
                  fill
                  sizes="19rem"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
          <div>
            <ServiceMenu services={servicesByCategory("ongles")} />
            <Reveal delay={150}>
              <p className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-taupe">
                <SparkleIcon width={17} height={17} className="mt-0.5 shrink-0 text-bronze" />
                Le nail art (french, babyboomer, strass…) se réserve en
                complément d&apos;une pose ou d&apos;un remplissage. Précisez
                vos envies lors de la réservation.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Maquillage ───────────────────────────────────────────────────── */}
      <section id="maquillage" className="scroll-mt-20 border-t border-sand-deep/70 bg-sand">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:px-8 md:py-20">
          <div>
            <SectionHeading
              overline="Maquillage"
              title={
                <>
                  Une mise en beauté <em className="text-bronze">sur mesure</em>
                </>
              }
              intro="Du maquillage naturel du quotidien au jour J, en passant par les shootings : un teint travaillé dans les règles de l'art."
            />
            <Reveal delay={150}>
              <div className="arch relative mt-10 hidden aspect-[4/5] max-w-[19rem] border border-sand-deep/60 md:block">
                <Image
                  src="/images/carte-maquillage.jpg"
                  alt="Maquillage professionnel — Kandylove Beauty"
                  fill
                  sizes="19rem"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
          <div>
            {MAQUILLAGE_GROUPES.map((groupe, index) => (
              <div key={groupe.label} className={index > 0 ? "mt-10" : undefined}>
                <Reveal>
                  <p className="overline-label mb-3">{groupe.label}</p>
                </Reveal>
                <ServiceMenu
                  services={groupe.ids
                    .map((id) => getService(id))
                    .filter((service) => service !== undefined)}
                />
              </div>
            ))}
            <Reveal delay={150}>
              <p className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-taupe">
                <SparkleIcon width={17} height={17} className="mt-0.5 shrink-0 text-bronze" />
                Pour la mariée : faux cils naturel +5 €, faux cils
                « volume » +10 €. Déplacement possible le jour J, sur demande.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Passerelle formation ─────────────────────────────────────────── */}
      <section className="border-t border-sand-deep/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center md:px-8 md:py-16">
          <Reveal>
            <div>
              <p className="overline-label">Transmettre le savoir-faire</p>
              <h2 className="font-display mt-3 text-2xl font-medium md:text-3xl">
                Devenez prothésiste ongulaire —{" "}
                <em className="text-bronze">coaching privé de 2 jours</em>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Link href="/formations" className="btn btn-outline shrink-0">
              Voir les formations
              <ArrowRightIcon width={15} height={15} />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBand
        title="Vos mains méritent la signature Kandylove"
        subtitle="Réservez votre pose, votre remplissage ou votre mise en beauté en quelques instants."
      />
      <MobileBookBar />
    </>
  );
}
