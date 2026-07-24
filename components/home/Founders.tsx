import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";

export function Founders() {
  return (
    <section className="halo-blush">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8 md:py-24">
        <Reveal>
          <div className="relative mx-auto max-w-[22rem] md:max-w-none">
            <div
              aria-hidden
              className="absolute -top-4 -left-4 h-full w-full border border-bronze/30"
            />
            <Image
              src="/images/fondatrices.jpg"
              alt="Viminde Kandy et Viminde Nafi, fondatrices de Maison Kanali"
              width={640}
              height={420}
              sizes="(max-width: 768px) 88vw, 40rem"
              className="relative w-full border border-sand-deep object-cover"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="overline-label">La maison</p>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="font-display mt-4 text-3xl leading-[1.12] font-medium text-balance md:text-[2.6rem]">
              Deux co-fondatrices, une vision :{" "}
              <em className="text-bronze">faire de la beauté un métier d&apos;art</em>
            </h2>
          </Reveal>
          <Reveal delay={180}>
            <p className="mt-6 max-w-lg text-[0.9375rem] leading-relaxed text-taupe">
              Maison Kanali est née des mains de Viminde Kandy et Viminde Nafi,
              ses deux co-fondatrices. Sous un même toit, chacune dirige sa
              propre marque — Kandylove Beauty pour la beauté, Naftali pour le
              regard : une seule maison, deux pôles, une même exigence.
            </p>
          </Reveal>
          <Reveal delay={270}>
            <Link href="/a-propos" className="link-line mt-8 text-bronze">
              Notre histoire
              <ArrowRightIcon width={15} height={15} />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
