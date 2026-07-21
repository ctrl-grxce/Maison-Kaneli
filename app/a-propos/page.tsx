import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/lib/config";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CtaBand } from "@/components/home/CtaBand";
import {
  InstagramIcon,
  MapPinIcon,
  ClockIcon,
  SparkleIcon,
  PetalIcon,
  HandsIcon,
  DiplomaIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "L'histoire de Maison Kanali : un showroom beauté sur rendez-vous fondé à Saint-Quentin par Viminde Kandy et Viminde Nafi, autour de Kandylove Beauty et Naftali.",
};

const VALUES = [
  {
    icon: SparkleIcon,
    title: "Excellence",
    text: "Des gestes précis, des produits choisis, des finitions irréprochables.",
  },
  {
    icon: HandsIcon,
    title: "Confiance",
    text: "Une relation sincère et durable avec chaque cliente et chaque élève.",
  },
  {
    icon: PetalIcon,
    title: "Convivialité",
    text: "Un accueil chaleureux, inclusif, où chacune se sent à sa place.",
  },
  {
    icon: DiplomaIcon,
    title: "Transmission",
    text: "Un savoir-faire partagé à travers des formations exigeantes.",
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        overline="Notre histoire"
        title={
          <>
            Une maison née d&apos;un <em className="text-bronze">métier d&apos;art</em>
          </>
        }
        intro="Maison Kanali est l'aboutissement de plus de huit années de passion : un showroom beauté intimiste, à Saint-Quentin, où chaque visite se vit sur rendez-vous."
      />

      {/* ── Histoire ─────────────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:gap-16 md:px-8 md:py-20">
        <Reveal>
          <div className="relative mx-auto max-w-[24rem] md:max-w-none">
            <div
              aria-hidden
              className="absolute -top-4 -right-4 h-full w-full border border-gold/40"
            />
            <Image
              src="/images/fondatrices.jpg"
              alt="Viminde Kandy et Viminde Nafi, fondatrices de Maison Kanali"
              width={640}
              height={420}
              sizes="(max-width: 768px) 88vw, 38rem"
              className="relative w-full border border-sand-deep object-cover"
            />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <p className="overline-label">De Kandylove Beauty à Maison Kanali</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="font-display mt-4 text-3xl leading-[1.12] font-medium md:text-[2.4rem]">
              Huit ans de métier,{" "}
              <em className="text-bronze">un écrin pour les réunir</em>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-taupe">
              <p>
                Tout commence avec Kandylove Beauty : plus de huit années de
                prothésie ongulaire, une clientèle fidèle et un réseau
                d&apos;élèves formées au fil des ans.
              </p>
              <p>
                Maison Kanali est la suite naturelle de cette aventure : un
                showroom pensé comme un écrin, où l&apos;activité historique des
                ongles et du maquillage rencontre Naftali, la maison du regard,
                et où les formations professionnelles trouvent leur salle de
                classe.
              </p>
              <p>
                Le tout, sur rendez-vous uniquement — pour un accueil
                personnalisé, un environnement calme et une qualité de service
                sans compromis.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Fondatrices ──────────────────────────────────────────────────── */}
      <section className="border-y border-sand-deep/70 bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <SectionHeading
            align="center"
            overline="Les fondatrices"
            title={
              <>
                Deux fondatrices, <em className="text-bronze">deux expertises</em>
              </>
            }
            intro="Chacune dirige sa maison ; ensemble, elles ont imaginé un lieu où l'exigence rencontre la douceur."
          />
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            <Reveal delay={100}>
              <div className="h-full border border-sand-deep bg-white p-8 text-center">
                <p className="font-display text-2xl font-medium">Viminde Kandy</p>
                <p className="overline-label mt-2 text-[0.62rem]">
                  Fondatrice · CEO Kandylove Beauty
                </p>
                <div className="hairline mx-auto my-5 w-10 bg-bronze/50" />
                <p className="text-sm leading-relaxed text-taupe">
                  Responsable du pôle beauté, forte de plus de huit ans de
                  métier. Prothésiste ongulaire et maquilleuse professionnelle,
                  elle veille sur chaque prestation et forme la nouvelle
                  génération.
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="h-full border border-sand-deep bg-white p-8 text-center">
                <p className="font-display text-2xl font-medium">Viminde Nafi</p>
                <p className="overline-label mt-2 text-[0.62rem] text-gold">
                  Co-fondatrice · CEO Naftali
                </p>
                <div className="hairline mx-auto my-5 w-10 bg-gold/60" />
                <p className="text-sm leading-relaxed text-taupe">
                  Associée stratégique et regard de la maison. À la tête de
                  Naftali, elle développe l&apos;univers des extensions de cils
                  et la vision de Maison Kanali.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Valeurs ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
        <SectionHeading
          align="center"
          overline="Nos valeurs"
          title={
            <>
              Ce qui nous <em className="text-bronze">guide</em>
            </>
          }
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value, index) => (
            <Reveal key={value.title} delay={index * 100}>
              <div className="flex h-full flex-col items-center border border-sand-deep bg-white p-7 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-t-full border border-sand-deep bg-ivory text-bronze">
                  <value.icon width={23} height={23} />
                </span>
                <h3 className="font-display mt-4 text-xl font-medium">
                  {value.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-taupe">
                  {value.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Informations pratiques ───────────────────────────────────────── */}
      <section className="border-t border-sand-deep/70 bg-blush">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-18">
          <div className="mx-auto grid max-w-3xl gap-6 text-center sm:grid-cols-3">
            <Reveal>
              <div>
                <MapPinIcon width={22} height={22} className="mx-auto text-bronze" />
                <p className="overline-label mt-3 text-[0.62rem]">Adresse</p>
                <p className="mt-2 text-sm text-espresso/85">
                  {CONTACT.city} · {CONTACT.region}
                  <br />
                  <span className="text-taupe">
                    Adresse précise communiquée à la réservation
                  </span>
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div>
                <ClockIcon width={22} height={22} className="mx-auto text-bronze" />
                <p className="overline-label mt-3 text-[0.62rem]">Horaires</p>
                <p className="mt-2 text-sm text-espresso/85">
                  Lundi – Samedi
                  <br />
                  10h00 – 17h00
                </p>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div>
                <InstagramIcon width={22} height={22} className="mx-auto text-bronze" />
                <p className="overline-label mt-3 text-[0.62rem]">Instagram</p>
                <p className="mt-2 text-sm text-espresso/85">
                  <a
                    href={`https://instagram.com/${CONTACT.instagramKandylove}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-bronze"
                  >
                    @{CONTACT.instagramKandylove}
                  </a>
                  <br />
                  <a
                    href={`https://instagram.com/${CONTACT.instagramNaftali}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-bronze"
                  >
                    @{CONTACT.instagramNaftali}
                  </a>
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <CtaBand
        title="Poussez la porte de la maison"
        subtitle="Le showroom vous accueille sur rendez-vous, du lundi au samedi."
      />

      {/* ── Crédit ───────────────────────────────────────────────────────── */}
      <div className="bg-espresso">
        <div className="mx-auto max-w-6xl border-t border-ivory/10 px-4 py-5 text-center md:px-8">
          <p className="text-[0.68rem] tracking-[0.14em] text-ivory/45 uppercase">
            Site conçu par Gradi Palaba, ingénieur chez Gald Corp — maintenu
            par Gald Corp
          </p>
        </div>
      </div>
    </>
  );
}
