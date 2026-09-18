import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";

/*
 * « Nos services » — demandé par Gradi le 18/09 : l'ancien titre (« L'excellence
 * a deux signatures ») et des cartes titrées au nom des marques ne disaient
 * pas à une nouvelle cliente CE QU'ON FAIT ici. « Naftali » ne signifie rien
 * pour qui arrive d'Instagram ; « Extensions de cils », si.
 *
 * Chaque carte se lit donc dans l'ordre où la cliente se pose les questions :
 * quoi (grand titre) → qui (petite ligne au-dessus) → lesquelles précisément
 * (pastilles) → où voir les prix (bouton explicite).
 */

const POLES = [
  {
    href: "/kandylove",
    what: (
      <>
        Ongles <em className="text-bronze-dark">&amp;</em> maquillage
      </>
    ),
    who: "Kandylove Beauty · par Viminde Kandy",
    summary:
      "Des mains et des pieds impeccables, et un maquillage sur mesure — du teint naturel au jour J.",
    services: [
      "Manucure",
      "Semi-permanent",
      "Gainage",
      "Extensions",
      "Pédicure",
      "Maquillage",
    ],
    image: "/images/realisation-brun.jpg",
    alt: "Pose gel brun glacé — réalisation Kandylove Beauty",
    imagePosition: "object-[50%_35%]",
    tone: {
      card: "bg-blush hover:border-bronze/40 hover:shadow-[0_24px_50px_-28px_rgba(169,116,79,0.45)]",
      arch: "border-blush-deep/70",
      accent: "text-bronze-dark",
      chip: "border-bronze/30",
    },
  },
  {
    href: "/naftali",
    what: "Extensions de cils",
    who: "Naftali · par Viminde Nafi",
    summary:
      "Un regard intense et naturel, posé cil par cil — du plus délicat au plus volumineux.",
    services: ["Cil à cil", "Pose mixte", "Volume russe", "Remplissage"],
    image: "/images/cils-regard.jpg",
    alt: "Extensions de cils — Naftali",
    imagePosition: "object-[50%_38%]",
    tone: {
      card: "bg-ivory hover:border-gold/50 hover:shadow-[0_24px_50px_-28px_rgba(194,160,95,0.5)]",
      arch: "border-gold/25",
      accent: "text-gold-deep",
      chip: "border-gold/40",
    },
  },
] as const;

export function TwoHouses() {
  return (
    <section className="border-y border-sand-deep/70 bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <SectionHeading
          align="center"
          overline="Sur rendez-vous à Saint-Quentin"
          title={
            <>
              Nos <em className="text-bronze">services</em>
            </>
          }
          intro="Deux spécialistes sous le même toit : les ongles et le maquillage d'un côté, les extensions de cils de l'autre."
        />

        <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2">
          {POLES.map((pole, index) => (
            <Reveal key={pole.href} delay={100 * (index + 1)}>
              <Link
                href={pole.href}
                className={`group flex h-full flex-col border border-sand-deep p-7 transition-all duration-500 hover:-translate-y-1 md:p-10 ${pole.tone.card}`}
              >
                <div
                  className={`relative h-40 overflow-hidden rounded-t-full border md:h-48 ${pole.tone.arch}`}
                >
                  <Image
                    src={pole.image}
                    alt={pole.alt}
                    fill
                    sizes="(max-width: 768px) 90vw, 34rem"
                    className={`object-cover transition-transform duration-700 group-hover:scale-[1.04] ${pole.imagePosition}`}
                  />
                </div>

                <p className={`overline-label mt-8 ${pole.tone.accent}`}>
                  {pole.who}
                </p>
                <h3 className="font-display mt-3 text-[2rem] leading-tight font-medium text-espresso md:text-4xl">
                  {pole.what}
                </h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-espresso/80">
                  {pole.summary}
                </p>

                <ul
                  className="mt-5 flex flex-wrap gap-2"
                  aria-label="Prestations proposées"
                >
                  {pole.services.map((service) => (
                    <li
                      key={service}
                      className={`border bg-white/70 px-3 py-1.5 text-[0.8125rem] font-medium text-espresso ${pole.tone.chip}`}
                    >
                      {service}
                    </li>
                  ))}
                </ul>

                {/* mt-auto : le bouton reste aligné en bas des deux cartes,
                    même quand l'une a plus de pastilles que l'autre. */}
                <span
                  className={`link-line mt-auto pt-8 font-medium ${pole.tone.accent}`}
                >
                  Voir les prestations et les tarifs
                  <ArrowRightIcon
                    width={15}
                    height={15}
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
