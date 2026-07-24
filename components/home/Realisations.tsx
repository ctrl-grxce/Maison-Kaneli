import Image from "next/image";
import { CONTACT } from "@/lib/config";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const PHOTOS = [
  { src: "/images/realisation-brun.jpg", alt: "Pose gel brun glacé", arch: true },
  { src: "/images/realisation-french.jpg", alt: "French manucure", arch: false },
  { src: "/images/realisation-strass.jpg", alt: "French strass émeraude", arch: true },
  { src: "/images/cils-regard.jpg", alt: "Extensions de cils — Naftali", arch: false },
  { src: "/images/realisation-rouge.jpg", alt: "Manucure rouge signature", arch: true },
  { src: "/images/realisation-neon.jpg", alt: "Nail art néon & feuille d'or", arch: false },
  { src: "/images/eleve-pois.jpg", alt: "French à pois — réalisation d'élève", arch: true },
] as const;

function Ribbon({ hidden = false }: { hidden?: boolean }) {
  return (
    <div aria-hidden={hidden} className="flex shrink-0">
      {PHOTOS.map((photo) => (
        <figure
          key={photo.src}
          className={cn(
            "relative mx-2.5 h-60 w-44 shrink-0 overflow-hidden border border-sand-deep/70 md:h-72 md:w-52",
            photo.arch ? "rounded-t-full" : "rounded-[2px]",
          )}
        >
          <Image
            src={photo.src}
            alt={hidden ? "" : photo.alt}
            fill
            sizes="13rem"
            className="object-cover"
          />
        </figure>
      ))}
    </div>
  );
}

/** Ruban défilant des réalisations — la preuve par l'image. */
export function Realisations() {
  return (
    <section className="border-y border-sand-deep/70 bg-blush/40 py-16 md:py-24">
      <SectionHeading
        align="center"
        overline="La galerie"
        title={
          <>
            Nos <em className="text-bronze">réalisations</em>, au fil des années
          </>
        }
        intro="Poses gel, french, nail art, extensions de cils : un aperçu du travail signé Maison Kanali."
        className="px-4"
      />

      <div className="marquee mt-12 md:mt-16" aria-label="Galerie des réalisations">
        <div className="marquee-track">
          <Ribbon />
          <Ribbon hidden />
        </div>
      </div>

      <p className="mt-10 text-center text-[0.68rem] tracking-[0.2em] text-taupe uppercase">
        Chaque nouveauté sur Instagram ·{" "}
        <a
          href={`https://instagram.com/${CONTACT.instagramKandylove}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bronze hover:underline"
        >
          @{CONTACT.instagramKandylove}
        </a>{" "}
        ·{" "}
        <a
          href={`https://instagram.com/${CONTACT.instagramNaftali}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          @{CONTACT.instagramNaftali}
        </a>
      </p>
    </section>
  );
}
