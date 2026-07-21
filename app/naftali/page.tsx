import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { servicesByCategory } from "@/lib/services";
import { PageHero } from "@/components/ui/PageHero";
import { ServiceMenu } from "@/components/ui/ServiceMenu";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MobileBookBar } from "@/components/layout/MobileBookBar";
import { CtaBand } from "@/components/home/CtaBand";
import { ArrowRightIcon, EyeIcon, PetalIcon, SparkleIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Naftali — Extensions de cils",
  description:
    "Naftali, by Maison Kanali : extensions de cils cil à cil, pose mixte et volume russe à Saint-Quentin. Un regard signé, sur rendez-vous.",
};

const RITUAL = [
  {
    icon: PetalIcon,
    title: "L'écoute",
    text: "Forme de l'œil, effet recherché, quotidien : la pose se dessine avec vous.",
  },
  {
    icon: EyeIcon,
    title: "La pose",
    text: "Cil après cil, dans le calme — précision, légèreté et respect du cil naturel.",
  },
  {
    icon: SparkleIcon,
    title: "Le regard",
    text: "Un résultat aérien qui tient, et des conseils pour l'entretenir.",
  },
] as const;

export default function NaftaliPage() {
  return (
    <>
      <PageHero
        tone="gold"
        overline="By Maison Kanali"
        title={
          <>
            L&apos;art du regard, signé{" "}
            <em className="text-gold">Naftali</em>
          </>
        }
        intro="La maison du regard de Maison Kanali, dirigée par sa fondatrice Viminde Nafi : du cil à cil le plus naturel au volume russe le plus couture."
      />

      {/* ── Carte des poses ──────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:px-8 md:py-20">
        <div>
          <SectionHeading
            overline="Extensions de cils"
            title={
              <>
                La carte <em className="text-gold">des poses</em>
              </>
            }
            intro="Chaque tarif est confirmé avec vous à la réservation, selon l'effet recherché et la nature de vos cils."
          />
          <Reveal delay={150}>
            <div className="relative mt-10 hidden aspect-[4/5] max-w-[19rem] overflow-hidden rounded-t-full border border-gold/30 md:block">
              <Image
                src="/images/carte-cils.jpg"
                alt="Extensions de cils — Naftali"
                fill
                sizes="19rem"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
        <ServiceMenu services={servicesByCategory("cils")} accent="gold" />
      </section>

      {/* ── Le rituel ────────────────────────────────────────────────────── */}
      <section className="border-y border-sand-deep/70 bg-[#f7f0e2]">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <Reveal className="mx-auto max-w-md">
            <Image
              src="/images/naftali-logo-or.jpg"
              alt="Naftali"
              width={420}
              height={420}
              sizes="(max-width: 768px) 60vw, 24rem"
              className="mx-auto w-52 object-contain mix-blend-multiply md:w-64"
            />
          </Reveal>
          <div className="mx-auto mt-10 grid max-w-4xl gap-10 sm:grid-cols-3">
            {RITUAL.map((step, index) => (
              <Reveal key={step.title} delay={index * 120}>
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-t-full border border-gold/40 bg-ivory text-gold">
                    <step.icon width={24} height={24} />
                  </span>
                  <h3 className="font-display mt-4 text-xl font-medium">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-[15rem] text-sm leading-relaxed text-taupe">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Passerelle formation ─────────────────────────────────────────── */}
      <section>
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-12 md:flex-row md:items-center md:px-8 md:py-16">
          <Reveal>
            <div>
              <p className="overline-label text-gold">Formation professionnelle</p>
              <h2 className="font-display mt-3 text-2xl font-medium md:text-3xl">
                Apprenez l&apos;extension de cils{" "}
                <em className="text-gold">auprès de Naftali</em>
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
        title="Offrez un écrin à votre regard"
        subtitle="Cil à cil, mixte ou volume russe : réservez votre pose en quelques instants."
      />
      <MobileBookBar />
    </>
  );
}
