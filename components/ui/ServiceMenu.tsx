import Link from "next/link";
import { activePromo, type Service } from "@/lib/services";
import { formatDuration, cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ClockIcon } from "./icons";

interface ServiceMenuProps {
  services: Service[];
  /** Accent « bronze » (Kandylove) ou « gold » (Naftali). */
  accent?: "bronze" | "gold";
  className?: string;
}

/**
 * Carte tarifaire — la cliente doit trouver « quelle prestation, combien,
 * combien de temps » en deux secondes, pouce sur l'écran.
 *
 * Trois niveaux de lecture, dans cet ordre :
 *   1. la ligne NOM ————— TARIF, alignée sur une même ligne de base, les deux
 *      à l'encre espresso : c'est elle qu'on balaie ;
 *   2. la description, en taupe et d'un corps inférieur — présente, jamais
 *      concurrente ;
 *   3. le pied de bloc, durée à gauche et bouton à droite.
 * Chaque prestation est posée sur sa propre carte blanche cernée d'un filet :
 * l'ancienne liste divisée fondait les prestations les unes dans les autres.
 */
export function ServiceMenu({
  services,
  accent = "bronze",
  className,
}: ServiceMenuProps) {
  const gold = accent === "gold";

  return (
    <ul className={cn("space-y-3", className)}>
      {services.map((service, index) => {
        const promo = activePromo(service);
        const prix = promo ? promo.price : service.price;
        /* « Sur devis », « Sur demande » : un tarif en toutes lettres tient la
           même encre mais un corps plus mesuré, sinon il mange le nom. */
        const tarifEnLettres = !/\d/.test(prix);

        return (
          <Reveal key={service.id} delay={Math.min(index, 4) * 70}>
            <li
              className={cn("carte-tarif", gold && "carte-tarif-or")}
            >
              {/* Le bandeau promo prend toute la largeur : à 375 px, collé au
                  tarif, il n'aurait plus laissé de place au nom. */}
              {promo ? (
                <p
                  className={cn(
                    "mb-2.5 inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-normal tracking-[0.14em] uppercase",
                    gold
                      ? "border-gold-deep/40 bg-gold/15 text-gold-deep"
                      : "border-bronze-dark/40 bg-bronze/12 text-bronze-dark",
                  )}
                >
                  Promo · {promo.until}
                </p>
              ) : null}

              {/* Ligne de balayage : nom et tarif sur la même ligne de base. */}
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display min-w-0 text-[1.22rem] leading-tight font-semibold md:text-[1.35rem]">
                  {service.name}
                </h3>
                <p className={cn("tarif", tarifEnLettres && "tarif-mention")}>
                  {prix}
                </p>
              </div>

              <p className="mt-2 max-w-md text-[0.875rem] leading-relaxed text-taupe">
                {service.description}
              </p>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sand-deep bg-ivory px-3 py-1.5 text-[0.68rem] tracking-[0.12em] text-taupe uppercase">
                  <ClockIcon width={13} height={13} aria-hidden />
                  {formatDuration(service.durationMin)}
                </span>
                <Link
                  href={`/rendez-vous?service=${service.id}`}
                  aria-label={`Réserver : ${service.name}`}
                  /* h-11 = 44 px : la cible tactile minimale de la charte. */
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center justify-center rounded-[2px] border px-5 text-[0.66rem] tracking-[0.18em] uppercase transition-colors duration-300",
                    gold
                      ? "border-gold-deep/45 text-gold-deep hover:bg-gold-deep hover:text-ivory"
                      : "border-bronze-dark/45 text-bronze-dark hover:bg-bronze-dark hover:text-ivory",
                  )}
                >
                  Réserver
                </Link>
              </div>
            </li>
          </Reveal>
        );
      })}
    </ul>
  );
}
