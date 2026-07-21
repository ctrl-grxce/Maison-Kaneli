import type { Metadata } from "next";
import Link from "next/link";
import { FORMATIONS } from "@/lib/services";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { MobileBookBar } from "@/components/layout/MobileBookBar";
import { CheckIcon, DiplomaIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Formations professionnelles",
  description:
    "Formations professionnelles Maison Kanali : coaching privé onglerie (2 jours, certificat inclus) par Kandylove Beauty et formation extensions de cils par Naftali.",
};

export default function FormationsPage() {
  return (
    <>
      <PageHero
        overline="Centre de formation"
        title={
          <>
            Transmettre un <em className="text-bronze">savoir-faire</em>
          </>
        }
        intro="Huit années de métier, un réseau d'élèves déjà formées : Maison Kanali accompagne celles et ceux qui veulent faire de la beauté leur profession."
      />

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {FORMATIONS.map((formation, index) => {
            const gold = formation.brand === "naftali";
            return (
              <Reveal key={formation.id} delay={index * 130}>
                <article
                  className={cn(
                    "flex h-full flex-col border bg-white p-7 md:p-10",
                    gold ? "border-gold/35" : "border-sand-deep",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={cn(
                          "overline-label",
                          gold && "text-gold",
                        )}
                      >
                        {gold ? "Naftali · by Maison Kanali" : "Kandylove Beauty"}
                      </p>
                      <h2 className="font-display mt-3 text-[1.7rem] leading-tight font-medium md:text-3xl">
                        {formation.name}
                      </h2>
                    </div>
                    <span
                      className={cn(
                        "flex h-13 w-13 shrink-0 items-center justify-center rounded-t-full border",
                        gold
                          ? "border-gold/40 bg-[#f7f0e2] text-gold"
                          : "border-sand-deep bg-blush text-bronze",
                      )}
                    >
                      <DiplomaIcon width={24} height={24} />
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-taupe">
                    {formation.tagline}
                  </p>

                  <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3 border-y border-sand-deep/80 py-4">
                    <span className="text-[0.7rem] tracking-[0.2em] text-taupe uppercase">
                      {formation.durationLabel}
                    </span>
                    <span
                      className={cn(
                        "font-display text-2xl",
                        gold ? "text-gold" : "text-bronze",
                      )}
                    >
                      {formation.priceLabel}
                    </span>
                  </div>

                  {formation.kitOptions.length > 0 && (
                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                      {formation.kitOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between border border-sand-deep bg-ivory px-4 py-3"
                        >
                          <span className="text-sm">{option.label}</span>
                          <span className="font-display text-lg text-bronze">
                            {option.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-7 grid gap-8 sm:grid-cols-2">
                    <div>
                      <h3 className="overline-label text-[0.62rem] text-espresso/70">
                        Au programme
                      </h3>
                      <ul className="mt-4 space-y-2.5">
                        {formation.program.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm leading-snug">
                            <CheckIcon
                              width={15}
                              height={15}
                              className={cn(
                                "mt-0.5 shrink-0",
                                gold ? "text-gold" : "text-bronze",
                              )}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="overline-label text-[0.62rem] text-espresso/70">
                        Inclus
                      </h3>
                      <ul className="mt-4 space-y-2.5">
                        {formation.included.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm leading-snug">
                            <CheckIcon
                              width={15}
                              height={15}
                              className={cn(
                                "mt-0.5 shrink-0",
                                gold ? "text-gold" : "text-bronze",
                              )}
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-3 border-t border-sand-deep/80 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[0.7rem] tracking-[0.16em] text-taupe uppercase">
                      Places limitées
                    </p>
                    <Link
                      href={`/rendez-vous?formation=${formation.id}`}
                      className={cn("btn", gold ? "btn-dark" : "btn-primary")}
                    >
                      Demander mon inscription
                    </Link>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={150}>
          <p className="mx-auto mt-10 max-w-xl text-center text-sm leading-relaxed text-taupe">
            Les dates sont convenues ensemble après votre demande.
            Modalités de paiement et conditions communiquées lors de
            l&apos;inscription.
          </p>
        </Reveal>
      </section>
      <MobileBookBar />
    </>
  );
}
