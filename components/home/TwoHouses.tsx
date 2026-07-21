import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";

export function TwoHouses() {
  return (
    <section className="border-y border-sand-deep/70 bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <SectionHeading
          align="center"
          overline="Deux maisons, un même écrin"
          title={
            <>
              L&apos;excellence a <em className="text-bronze">deux signatures</em>
            </>
          }
          intro="Kandylove Beauty, la maison fondatrice dédiée aux ongles et au maquillage, et Naftali, sa maison sœur consacrée au regard."
        />

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2">
          {/* ── Kandylove Beauty ────────────────────────────────────────── */}
          <Reveal delay={100}>
            <Link
              href="/kandylove"
              className="group block h-full border border-sand-deep bg-blush p-8 transition-all duration-500 hover:-translate-y-1 hover:border-bronze/40 hover:shadow-[0_24px_50px_-28px_rgba(169,116,79,0.45)] md:p-10"
            >
              <div className="relative h-40 overflow-hidden rounded-t-full border border-blush-deep/70 md:h-48">
                <Image
                  src="/images/carte-ongles.jpg"
                  alt="Prothésie ongulaire — Kandylove Beauty"
                  fill
                  sizes="(max-width: 768px) 90vw, 34rem"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <p className="overline-label mt-8">La maison fondatrice</p>
              <h3 className="font-display mt-3 text-3xl font-medium">
                Kandylove Beauty
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-taupe">
                Plus de huit années de prothésie ongulaire — pose gel,
                remplissage, nail art — et un maquillage sur mesure, du teint
                naturel au jour J.
              </p>
              <span className="link-line mt-7 text-bronze">
                Découvrir
                <ArrowRightIcon
                  width={15}
                  height={15}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </Reveal>

          {/* ── Naftali ─────────────────────────────────────────────────── */}
          <Reveal delay={200}>
            <Link
              href="/naftali"
              className="group block h-full border border-sand-deep bg-ivory p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_24px_50px_-28px_rgba(194,160,95,0.5)] md:p-10"
            >
              <div className="relative flex h-40 items-center justify-center overflow-hidden rounded-t-full border border-gold/25 bg-[#f7f0e2] md:h-48">
                <Image
                  src="/images/naftali-logo-or.jpg"
                  alt="Naftali — extensions de cils"
                  width={280}
                  height={280}
                  sizes="18rem"
                  className="w-56 object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.05]"
                />
              </div>
              <p className="overline-label mt-8 text-gold">By Maison Kanali</p>
              <h3 className="font-display mt-3 text-3xl font-medium">Naftali</h3>
              <p className="mt-3 text-sm leading-relaxed text-taupe">
                La maison du regard : extensions de cils posées à la perfection,
                du cil à cil délicat au volume russe le plus aérien.
              </p>
              <span className="link-line mt-7 text-gold">
                Découvrir
                <ArrowRightIcon
                  width={15}
                  height={15}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
