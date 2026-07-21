import Link from "next/link";
import type { Service } from "@/lib/services";
import { formatDuration, cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { ArrowRightIcon } from "./icons";

interface ServiceMenuProps {
  services: Service[];
  /** Accent « bronze » (Kandylove) ou « gold » (Naftali). */
  accent?: "bronze" | "gold";
  className?: string;
}

/** Carte tarifaire — lignes élégantes avec durée, tarif et réservation. */
export function ServiceMenu({
  services,
  accent = "bronze",
  className,
}: ServiceMenuProps) {
  const accentText = accent === "gold" ? "text-gold" : "text-bronze";

  return (
    <ul className={cn("divide-y divide-sand-deep/80 border-y border-sand-deep", className)}>
      {services.map((service, index) => (
        <Reveal key={service.id} delay={Math.min(index, 4) * 70}>
          <li className="group py-5 md:py-6">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-xl leading-snug font-medium md:text-[1.4rem]">
                {service.name}
              </h3>
              <span
                aria-hidden
                className="hairline hidden min-w-8 flex-1 self-center opacity-70 sm:block"
              />
              <p
                className={cn(
                  "font-display text-lg whitespace-nowrap md:text-xl",
                  accentText,
                )}
              >
                {service.price}
              </p>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <p className="max-w-xl text-sm leading-relaxed text-taupe">
                {service.description}
              </p>
              <div className="flex items-center gap-5 whitespace-nowrap">
                <span className="text-[0.68rem] tracking-[0.18em] text-taupe uppercase">
                  {formatDuration(service.durationMin)}
                </span>
                <Link
                  href={`/rendez-vous?service=${service.id}`}
                  className={cn("link-line", accentText)}
                  aria-label={`Réserver : ${service.name}`}
                >
                  Réserver
                  <ArrowRightIcon
                    width={13}
                    height={13}
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}
