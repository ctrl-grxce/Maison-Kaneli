"use client";

import { useEffect, useRef } from "react";

/**
 * Film de marque du hero — lecture automatique, silencieuse, en boucle.
 * Si la personne préfère réduire les animations, la vidéo reste sur
 * son image fixe (poster).
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    const play = () => {
      video.play().catch(() => {
        /* Autoplay refusé par le navigateur : le poster reste affiché. */
      });
    };

    play();
    /* Certains navigateurs suspendent la vidéo en arrière-plan sans la
       relancer : on reprend la lecture au retour sur l'onglet. */
    const onVisible = () => {
      if (!document.hidden) play();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover object-center md:object-[62%_50%]"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/images/hero-poster.jpg"
      aria-hidden
      tabIndex={-1}
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}
