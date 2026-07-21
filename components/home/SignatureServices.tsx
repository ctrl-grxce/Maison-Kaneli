import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRightIcon } from "@/components/ui/icons";

const SIGNATURES = [
  {
    serviceId: "pose-complete",
    image: "/images/carte-ongles.jpg",
    alt: "Pose complète gel",
    house: "Kandylove Beauty",
    name: "Pose complète gel",
    price: "À partir de 50 €",
    href: "/kandylove#onglerie",
  },
  {
    serviceId: "mariee-jour-j",
    image: "/images/carte-maquillage.jpg",
    alt: "Maquillage mariée",
    house: "Kandylove Beauty",
    name: "Maquillage mariée",
    price: "80 €",
    href: "/kandylove#maquillage",
  },
  {
    serviceId: "volume-russe",
    image: "/images/carte-cils.jpg",
    alt: "Extensions de cils volume russe",
    house: "Naftali",
    name: "Volume russe",
    price: "Sur demande",
    href: "/naftali",
  },
] as const;

export function SignatureServices() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
      <SectionHeading
        overline="Prestations signature"
        title={
          <>
        Ce que nos clientes <em className="text-bronze">préfèrent</em>
          </>
        }
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
        {SIGNATURES.map((item, index) => (
          <Reveal key={item.serviceId} delay={index * 110}>
            <article className="group flex h-full flex-col border border-sand-deep bg-white transition-all duration-500 hover:-translate-y-1 hover:border-bronze/40 hover:shadow-[0_24px_50px_-30px_rgba(46,36,28,0.35)]">
              <Link
                href={item.href}
                className="relative block aspect-[4/3] overflow-hidden"
                tabIndex={-1}
                aria-hidden
              >
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                />
              </Link>
              <div className="flex flex-1 flex-col p-6">
                <p className="overline-label text-[0.6rem]">{item.house}</p>
                <div className="mt-2.5 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-[1.45rem] font-medium">
                    <Link href={item.href}>{item.name}</Link>
                  </h3>
                  <p className="font-display text-lg whitespace-nowrap text-bronze">
                    {item.price}
                  </p>
                </div>
                <div className="hairline my-5" />
                <div className="mt-auto flex items-center justify-between">
                  <Link href={item.href} className="link-line text-taupe">
                    En savoir plus
                  </Link>
                  <Link
                    href={`/rendez-vous?service=${item.serviceId}`}
                    className="link-line text-bronze"
                    aria-label={`Réserver : ${item.name}`}
                  >
                    Réserver
                    <ArrowRightIcon width={14} height={14} />
                  </Link>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
