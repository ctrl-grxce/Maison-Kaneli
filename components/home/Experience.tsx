import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalendarIcon, PetalIcon, SparkleIcon } from "@/components/ui/icons";

const PILLARS = [
  {
    icon: CalendarIcon,
    title: "Sur rendez-vous uniquement",
    text: "Aucune attente, aucun passage : votre créneau vous est entièrement réservé.",
  },
  {
    icon: PetalIcon,
    title: "Un accueil personnalisé",
    text: "Chaque prestation commence par une écoute attentive de vos envies.",
  },
  {
    icon: SparkleIcon,
    title: "Un écrin calme & professionnel",
    text: "Un showroom intimiste pensé pour faire de chaque visite une parenthèse.",
  },
] as const;

export function Experience() {
  return (
    <section className="border-y border-sand-deep/70 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <SectionHeading
          align="center"
          overline="L'expérience Maison Kanali"
          title={
            <>
              Un moment <em className="text-bronze">rien qu'à vous</em>
            </>
          }
        />

        <div className="mx-auto mt-12 grid max-w-4xl gap-10 sm:grid-cols-3 md:mt-16">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 120}>
              <div className="flex flex-col items-center text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-t-full border border-sand-deep bg-ivory text-bronze">
                  <pillar.icon width={26} height={26} />
                </span>
                <h3 className="font-display mt-5 text-xl font-medium">
                  {pillar.title}
                </h3>
                <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-taupe">
                  {pillar.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
