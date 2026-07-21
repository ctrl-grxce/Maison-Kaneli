import type { Metadata } from "next";
import Link from "next/link";
import { formatDateFr, formatTimeFr } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false },
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    ref?: string;
    s?: string;
    d?: string;
    t?: string;
    k?: string;
  }>;
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const isFormation = params.type === "f";
  const hasBooking = Boolean(params.ref && params.s);

  if (!hasBooking) {
    return (
      <section className="halo-blush">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center">
          <p className="overline-label">Réservation</p>
          <h1 className="font-display mt-4 text-4xl font-medium">
            Aucune réservation récente
          </h1>
          <Link href="/rendez-vous" className="btn btn-primary mt-9">
            Prendre rendez-vous
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="halo-blush">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-16 text-center md:py-24">
        <span className="flex h-16 w-16 items-center justify-center rounded-t-full border border-bronze/40 bg-blush text-bronze">
          <CheckIcon width={26} height={26} />
        </span>

        <p className="overline-label mt-7">
          {isFormation ? "Demande envoyée" : "Créneau réservé"}
        </p>
        <h1 className="font-display mt-4 max-w-xl text-4xl leading-[1.1] font-medium text-balance md:text-5xl">
          {isFormation ? (
            <>
              Merci — votre demande est{" "}
              <em className="text-bronze">entre de bonnes mains</em>
            </>
          ) : (
            <>
              C&apos;est noté — votre moment est{" "}
              <em className="text-bronze">réservé</em>
            </>
          )}
        </h1>

        <div className="mt-10 w-full max-w-md border border-sand-deep bg-white text-left">
          <div className="border-b border-sand-deep bg-blush/50 px-6 py-3.5">
            <p className="overline-label text-[0.62rem]">
              Référence {params.ref}
            </p>
          </div>
          <dl className="divide-y divide-sand-deep/70 px-6">
            <div className="flex items-baseline justify-between gap-6 py-3.5">
              <dt className="text-[0.68rem] tracking-[0.18em] text-taupe uppercase">
                {isFormation ? "Formation" : "Prestation"}
              </dt>
              <dd className="text-right text-[0.9375rem]">{params.s}</dd>
            </div>
            {params.k && (
              <div className="flex items-baseline justify-between gap-6 py-3.5">
                <dt className="text-[0.68rem] tracking-[0.18em] text-taupe uppercase">
                  Option
                </dt>
                <dd className="text-right text-[0.9375rem]">{params.k}</dd>
              </div>
            )}
            {params.d && (
              <div className="flex items-baseline justify-between gap-6 py-3.5">
                <dt className="text-[0.68rem] tracking-[0.18em] text-taupe uppercase">
                  Date
                </dt>
                <dd className="text-right text-[0.9375rem]">
                  {formatDateFr(params.d)}
                </dd>
              </div>
            )}
            {params.t && (
              <div className="flex items-baseline justify-between gap-6 py-3.5">
                <dt className="text-[0.68rem] tracking-[0.18em] text-taupe uppercase">
                  Heure
                </dt>
                <dd className="text-right text-[0.9375rem]">
                  {formatTimeFr(params.t)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <p className="mt-7 max-w-md text-sm leading-relaxed text-taupe">
          {isFormation
            ? "Maison Kanali vous recontacte très vite pour convenir des dates et des modalités. Un email récapitulatif vous a été adressé."
            : "Maison Kanali vous confirmera ce rendez-vous très prochainement. Un email récapitulatif vous a été adressé."}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/kandylove" className="btn btn-outline">
            Découvrir la maison
          </Link>
        </div>
      </div>
    </section>
  );
}
