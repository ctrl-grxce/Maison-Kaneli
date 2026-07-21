import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface PageHeroProps {
  overline: string;
  title: ReactNode;
  intro?: ReactNode;
  /** Halo d'ambiance : rosé (défaut) ou doré (Naftali). */
  tone?: "blush" | "gold";
  children?: ReactNode;
}

/** Ouverture de page intérieure — sobre, centrée, signature de la maison. */
export function PageHero({
  overline,
  title,
  intro,
  tone = "blush",
  children,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-b border-sand-deep/70",
        tone === "gold" ? "halo-gold" : "halo-blush",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-14 pb-12 text-center md:px-8 md:pt-20 md:pb-16">
        <Reveal>
          <p
            className={cn(
              "overline-label",
              tone === "gold" && "text-gold",
            )}
          >
            {overline}
          </p>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="font-display mt-5 max-w-3xl text-[2.4rem] leading-[1.08] font-medium text-balance md:text-[3.4rem]">
            {title}
          </h1>
        </Reveal>
        {intro ? (
          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-[0.9375rem] leading-relaxed text-taupe">
              {intro}
            </p>
          </Reveal>
        ) : null}
        {children ? <Reveal delay={270}>{children}</Reveal> : null}
      </div>
    </section>
  );
}
