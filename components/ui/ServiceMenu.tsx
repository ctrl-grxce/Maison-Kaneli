import Link from "next/link";
import type { Service } from "@/lib/services";
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
 * Carte tarifaire — lecture immédiate : nom + description à gauche,
 * prix bien visible et bouton Réserver à droite.
 */
export function ServiceMenu({
  services,
  accent = "bronze",
  className,
}: ServiceMenuProps) {
  const gold = accent === "gold";

  return (
    <ul
      className={cn(
        "divide-y divide-sand-deep/80 border-y border-sand-deep",
        className,
      )}
    >
      {services.map((service, index) => (
        <Reveal key={service.id} delay={Math.min(index, 4) * 70}>
          <li className="flex items-start justify-between gap-5 py-6 sm:gap-8">
            <div className="min-w-0">
              <h3 className="font-display text-xl leading-snug font-medium md:text-[1.4rem]">
                {service.name}
              </h3>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-taupe">
                {service.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-sand-deep bg-white px-3 py-1 text-[0.62rem] tracking-[0.14em] text-taupe uppercase">
                <ClockIcon width={13} height={13} aria-hidden />
                {formatDuration(service.durationMin)}
              </span>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3 text-right">
              <p
                className={cn(
                  "font-display text-xl leading-none whitespace-nowrap md:text-2xl",
                  gold ? "text-gold" : "text-bronze",
                )}
              >
                {service.price}
              </p>
              <Link
                href={`/rendez-vous?service=${service.id}`}
                aria-label={`Réserver : ${service.name}`}
                className={cn(
                  "inline-flex h-10 items-center justify-center rounded-[2px] border px-5 text-[0.66rem] tracking-[0.18em] uppercase transition-colors duration-300",
                  gold
                    ? "border-gold/55 text-gold hover:bg-gold hover:text-ivory"
                    : "border-bronze/50 text-bronze hover:bg-bronze hover:text-ivory",
                )}
              >
                Réserver
              </Link>
            </div>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}
