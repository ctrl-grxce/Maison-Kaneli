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

/* Regénéré chaque jour : la promo cils expire ainsi toute seule fin octobre. */
export const revalidate = 86400;

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
        intro="Le pôle regard de Maison Kanali, dirigé par sa fondatrice Viminde Nafi : du cil à cil le plus naturel au volume russe le plus couture."
      />

      {/* ── Offre spéciale — poses à 40 €, dépose à 20 € ─────────────────── */}
      <section className="border-b border-gold/25 bg-[#f7f0e2]">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-[0.9fr_1.1fr] md:gap-14 md:px-8 md:py-16">
          <Reveal>
            <div className="relative mx-auto aspect-square w-full max-w-[22rem] overflow-hidden rounded-t-full border border-gold/30">
              <Image
                src="/images/cils-naftali-signature.jpg"
                alt="Regard signé Naftali — extensions de cils"
                fill
                sizes="(max-width: 768px) 80vw, 22rem"
                className="object-cover"
              />
            </div>
          </Reveal>
          <div className="text-center md:text-left">
            <Reveal>
              <p className="overline-label text-gold">
                Offre spéciale · jusqu&apos;à fin octobre
              </p>
            </Reveal>
            <Reveal delay={90}>
              <h2 className="font-display mt-4 text-3xl leading-[1.12] font-medium md:text-[2.4rem]">
                Toutes les poses à <em className="text-gold">40 €</em>
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="mx-auto mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-taupe md:mx-0">
                Du cil à cil le plus naturel au volume russe le plus couture,
                remplissage compris : jusqu&apos;à fin octobre, chaque pose
                est à 40 € — et la dépose à 20 €. L&apos;occasion idéale de
                confier votre regard à Naftali.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-8">
                <Link href="/rendez-vous" className="btn btn-dark">
                  Réserver ma pose
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

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
            intro="Jusqu'à fin octobre, toutes les poses sont à 40 € et la dépose à 20 € — l'effet, lui, se dessine avec vous à la réservation."
          />
          <Reveal delay={150}>
            <div className="relative mt-10 hidden aspect-[4/5] max-w-[19rem] overflow-hidden rounded-t-full border border-gold/30 md:block">
              <Image
                src="/images/cils-regard.jpg"
                alt="Regard sublimé — extensions de cils Naftali"
                fill
                sizes="19rem"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
        <ServiceMenu services={servicesByCategory("cils")} accent="gold" />
      </section>

      {/* ── Le geste ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 md:px-8 md:pb-20">
        <SectionHeading
          align="center"
          overline="Dans l'atelier regard"
          title={
            <>
              Le geste, <em className="text-gold">en précision</em>
            </>
          }
          intro="Cil après cil, à la pince, dans le plus grand calme : la pose Naftali est un travail d'orfèvre."
        />
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
          {(
            [
              {
                src: "/images/cils-pose.jpg",
                alt: "Pose d'extensions de cils sur patch — Naftali",
                caption: "La pose, en douceur",
              },
              {
                src: "/images/cils-precision.jpg",
                alt: "Travail à la pince, cil après cil — Naftali",
                caption: "Cil après cil, à la pince",
              },
              {
                src: "/images/cils-rituel.jpg",
                alt: "Préparation de la pose, patchs de protection — Naftali",
                caption: "Le rituel, en cabine",
              },
            ] as const
          ).map((photo, index) => (
            <Reveal key={photo.src} delay={index * 130}>
              <figure>
                <div className="relative aspect-[5/4] overflow-hidden rounded-[2px] border border-gold/25">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 90vw, 24rem"
                    className="object-cover transition-transform duration-700 hover:scale-[1.05]"
                  />
                </div>
                <figcaption className="mt-3 text-center text-[0.65rem] tracking-[0.2em] text-taupe uppercase">
                  {photo.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Le rituel ────────────────────────────────────────────────────── */}
      <section className="border-y border-sand-deep/70 bg-[#f7f0e2]">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <Reveal className="mx-auto max-w-md">
            <div className="relative mx-auto aspect-[3/4] w-56 overflow-hidden rounded-t-full border border-gold/30 md:w-72">
              <Image
                src="/images/naftali-regard-rituel.jpg"
                alt="Regard sublimé aux extensions de cils — le rituel Naftali"
                fill
                sizes="(max-width: 768px) 14rem, 18rem"
                className="object-cover"
              />
            </div>
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
