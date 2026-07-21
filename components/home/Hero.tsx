import Image from "next/image";
import Link from "next/link";
import { CONTACT } from "@/lib/config";
import { Reveal } from "@/components/ui/Reveal";

export function Hero() {
  return (
    <section className="halo-blush relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-8 md:pt-20 md:pb-24">
        <div className="order-2 md:order-1">
          <Reveal>
            <p className="overline-label">
              Showroom beauté · {CONTACT.city}
            </p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="font-display mt-5 text-[2.6rem] leading-[1.06] font-medium text-balance md:text-[3.9rem]">
              L&apos;art de <em className="text-bronze">révéler</em>
              <br />
              votre beauté
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-md text-[0.9375rem] leading-relaxed text-taupe">
              Ongles, maquillage, regard : deux maisons d&apos;excellence vous
              reçoivent sur rendez-vous, dans un écrin pensé pour vous.
            </p>
          </Reveal>
          <Reveal delay={270}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/rendez-vous" className="btn btn-primary">
                Prendre rendez-vous
              </Link>
              <Link href="/kandylove" className="btn btn-outline">
                Découvrir la maison
              </Link>
            </div>
          </Reveal>
          <Reveal delay={360}>
            <p className="mt-9 text-[0.7rem] tracking-[0.2em] text-taupe uppercase">
              {CONTACT.scheduleLabel} · Sur rendez-vous
            </p>
          </Reveal>
        </div>

        <Reveal delay={150} className="order-1 md:order-2">
          <div className="relative mx-auto w-full max-w-[21rem] md:max-w-[24rem]">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-t-full bg-blush-deep/40 blur-2xl"
            />
            <div className="arch relative aspect-[4/5.4] border border-sand-deep/60 shadow-[0_30px_60px_-30px_rgba(46,36,28,0.35)]">
              <Image
                src="/images/hero-mains.jpg"
                alt="Mains aux ongles sublimés par Kandylove Beauty"
                fill
                priority
                sizes="(max-width: 768px) 84vw, 24rem"
                className="object-cover"
              />
            </div>
            <p className="mt-4 text-center text-[0.65rem] tracking-[0.28em] text-taupe uppercase">
              Kandylove Beauty · Naftali
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
