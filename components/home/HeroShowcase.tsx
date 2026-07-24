"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Les plus belles réalisations de la maison, en fondu enchaîné. */
const SLIDES = [
  {
    src: "/images/realisation-brun.jpg",
    alt: "Pose gel brun glacé — réalisation Kandylove Beauty",
  },
  {
    src: "/images/realisation-french.jpg",
    alt: "French manucure — réalisation Kandylove Beauty",
  },
  {
    src: "/images/realisation-strass.jpg",
    alt: "French strass émeraude — réalisation Kandylove Beauty",
  },
  {
    src: "/images/realisation-rouge.jpg",
    alt: "Manucure rouge signature — réalisation Kandylove Beauty",
  },
] as const;

const INTERVAL_MS = 4800;

/**
 * Carrousel du hero : crossfade lent + effet Ken Burns sur l'image active.
 * Respecte prefers-reduced-motion (image fixe, aucun défilement).
 */
export function HeroShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setIndex((previous) => (previous + 1) % SLIDES.length),
      INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="arch relative aspect-[4/5.4] border border-sand-deep/60 shadow-[0_30px_60px_-30px_rgba(46,36,28,0.35)]">
      {SLIDES.map((slide, slideIndex) => {
        const active = slideIndex === index;
        return (
          <div
            key={slide.src}
            aria-hidden={!active}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-in-out",
              active ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={slideIndex === 0}
              sizes="(max-width: 768px) 84vw, 24rem"
              className={cn("object-cover", active && "kenburns")}
            />
          </div>
        );
      })}
    </div>
  );
}
