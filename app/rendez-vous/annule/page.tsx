import type { Metadata } from "next";
import Link from "next/link";
import { ReleaseHold } from "@/components/booking/ReleaseHold";

export const metadata: Metadata = {
  title: "Paiement abandonné",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{ bid?: string }>;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Retour « annuler » depuis la page de paiement Stripe (docs/PAIEMENT.md). */
export default async function PaymentCancelledPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const bookingId =
    params.bid && UUID_PATTERN.test(params.bid) ? params.bid : null;

  return (
    <section className="halo-blush">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center">
        {bookingId && <ReleaseHold bookingId={bookingId} />}

        <p className="overline-label">Réservation</p>
        <h1 className="font-display mt-4 max-w-xl text-4xl leading-[1.1] font-medium text-balance md:text-5xl">
          Paiement <em className="text-bronze">abandonné</em>
        </h1>

        <p className="mt-7 max-w-md text-sm leading-relaxed text-taupe">
          Aucun montant n&apos;a été débité et le créneau que vous aviez choisi
          a été libéré. Vous pouvez reprendre votre réservation quand vous le
          souhaitez — cela ne prend que quelques instants.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/rendez-vous" className="btn btn-primary">
            Reprendre ma réservation
          </Link>
          <Link href="/" className="btn btn-outline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
