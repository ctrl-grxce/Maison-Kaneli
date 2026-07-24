import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/lib/config";
import { HeroShowcase } from "./HeroShowcase";

/**
 * Hero d'accueil — séquence de bienvenue animée :
 * titre dévoilé ligne à ligne, filet doré, carrousel des vraies réalisations.
 */
export function Hero() {
  return (
    <section className="halo-blush relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-8 md:pt-20 md:pb-24">
        <div className="order-2 md:order-1">
          <p
            className="hero-fade overline-label"
            style={{ animationDelay: "120ms" }}
          >
            Showroom beauté · {CONTACT.city}
          </p>
          <h1 className="font-display mt-5 text-[2.5rem] leading-[1.07] font-medium md:text-[3.6rem]">
            <span className="hero-mask">
              <span className="hero-line" style={{ animationDelay: "260ms" }}>
                Bienvenue chez
              </span>
            </span>
            <span className="hero-mask">
              <span className="hero-line" style={{ animationDelay: "430ms" }}>
                <em className="text-bronze">Maison Kanali</em>
              </span>
            </span>
          </h1>
          <span
            aria-hidden
            className="hero-rule mt-6 block h-px w-16 bg-gold"
            style={{ animationDelay: "780ms" }}
          />
          <p
            className="hero-fade mt-6 max-w-md text-[0.9375rem] leading-relaxed text-taupe"
            style={{ animationDelay: "900ms" }}
          >
            L&apos;art de révéler votre beauté — ongles, maquillage, regard :
            deux expertes vous reçoivent sur rendez-vous, dans un écrin pensé
            pour vous.
          </p>
          <div
            className="hero-fade mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "1020ms" }}
          >
            <Link href="/rendez-vous" className="btn btn-primary">
              Prendre rendez-vous
            </Link>
            <Link href="/kandylove" className="btn btn-outline">
              Découvrir la maison
            </Link>
          </div>
          <p
            className="hero-fade mt-9 text-[0.7rem] tracking-[0.2em] text-taupe uppercase"
            style={{ animationDelay: "1150ms" }}
          >
            {CONTACT.scheduleLabel} · Sur rendez-vous
          </p>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative mx-auto w-full max-w-[21rem] md:max-w-[24rem]">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-t-full bg-blush-deep/40 blur-2xl"
            />
            <div className="relative">
              <div className="hero-frame" style={{ animationDelay: "300ms" }}>
                <HeroShowcase />
              </div>
              {/* Petite arche flottante — le regard Naftali */}
              <div
                className="hero-fade absolute -bottom-6 -left-5 w-24 md:-left-9 md:w-28"
                style={{ animationDelay: "950ms" }}
              >
                <div className="hero-float arch relative aspect-[4/5] border-2 border-ivory shadow-[0_18px_36px_-18px_rgba(46,36,28,0.5)]">
                  <Image
                    src="/images/cils-regard.jpg"
                    alt="Extensions de cils — Naftali"
                    fill
                    sizes="7rem"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            <p
              className="hero-fade mt-5 text-center text-[0.65rem] tracking-[0.28em] text-taupe uppercase"
              style={{ animationDelay: "1150ms" }}
            >
              Kandylove Beauty · Naftali
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
