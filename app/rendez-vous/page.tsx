import type { Metadata } from "next";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Prendre rendez-vous",
  description:
    "Réservez votre prestation Maison Kanali en ligne : ongles et maquillage par Kandylove Beauty, extensions de cils par Naftali. Choisissez votre créneau en quelques instants.",
};

interface PageProps {
  searchParams: Promise<{ service?: string; formation?: string }>;
}

export default async function BookingPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className="halo-blush min-h-[70vh]">
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-16 md:px-8 md:pt-16 md:pb-24">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <p className="overline-label">Réservation en ligne</p>
            <h1 className="font-display mt-4 text-4xl leading-[1.08] font-medium text-balance md:text-5xl">
              Prendre <em className="text-bronze">rendez-vous</em>
            </h1>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-taupe">
              Quatre petites étapes, et votre moment est réservé.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <BookingWizard
            initialServiceId={params.service}
            initialFormationId={params.formation}
          />
        </Reveal>
      </div>
    </section>
  );
}
