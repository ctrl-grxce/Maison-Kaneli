import Link from "next/link";
import { CONTACT } from "@/lib/config";
import { HeroVideo } from "./HeroVideo";

/**
 * Hero d'accueil — un film de marque unique, fondu dans l'ivoire de la page :
 *   · desktop : vidéo plein cadre, dégradé crème de gauche (texte) vers la vidéo ;
 *   · mobile : vidéo en haut, le texte de bienvenue remonte sur son fondu bas.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      {/* ── Le film : en flux sur mobile, plein cadre sur desktop ───────── */}
      <div className="relative h-[56svh] min-h-[20rem] w-full md:absolute md:inset-0 md:h-full md:min-h-0">
        <HeroVideo />

        {/* Fondu haut — transition crème depuis le header */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-20"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--color-ivory) 80%, transparent), transparent)",
          }}
        />

        {/* Fondu bas (mobile) — la vidéo fond vers le texte de bienvenue */}
        <div
          aria-hidden
          className="absolute inset-0 md:hidden"
          style={{
            background:
              "linear-gradient(180deg, transparent 30%, color-mix(in srgb, var(--color-ivory) 55%, transparent) 62%, var(--color-ivory) 96%)",
          }}
        />

        {/* Fondu gauche (desktop) — l'ivoire du texte fond vers la vidéo */}
        <div
          aria-hidden
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              "linear-gradient(90deg, var(--color-ivory) 0%, var(--color-ivory) 34%, color-mix(in srgb, var(--color-ivory) 78%, transparent) 52%, color-mix(in srgb, var(--color-ivory) 28%, transparent) 66%, transparent 80%)",
          }}
        />

        {/* Fondu bas (desktop) — transition douce vers la suite de la page */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 hidden h-28 md:block"
          style={{
            background:
              "linear-gradient(180deg, transparent, var(--color-ivory))",
          }}
        />
      </div>

      {/* ── Le texte de bienvenue ───────────────────────────────────────── */}
      <div className="relative z-10 mx-auto -mt-40 max-w-6xl px-4 pb-16 md:mt-0 md:flex md:min-h-[min(84svh,50rem)] md:items-center md:px-8 md:pb-0">
        <div className="max-w-xl md:py-24">
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
      </div>
    </section>
  );
}
