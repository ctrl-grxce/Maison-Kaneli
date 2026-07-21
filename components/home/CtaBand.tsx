import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

interface CtaBandProps {
  title?: string;
  subtitle?: string;
}

export function CtaBand({
  title = "Votre moment commence ici",
  subtitle = "Choisissez votre prestation, votre date, votre créneau — la maison s'occupe du reste.",
}: CtaBandProps) {
  return (
    <section className="bg-espresso text-ivory">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:px-8 md:py-20">
        <Reveal>
          <p className="overline-label text-gold-soft">Réservation en ligne</p>
        </Reveal>
        <Reveal delay={90}>
          <h2 className="font-display mt-4 max-w-2xl text-3xl leading-[1.1] font-medium text-balance md:text-[2.7rem]">
            {title}
          </h2>
        </Reveal>
        <Reveal delay={180}>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/70">
            {subtitle}
          </p>
        </Reveal>
        <Reveal delay={270}>
          <Link
            href="/rendez-vous"
            className="btn btn-primary mt-9 min-w-[16rem]"
          >
            Prendre rendez-vous
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
