import Link from "next/link";
import { CONTACT } from "@/lib/config";
import { Logotype } from "@/components/ui/Logotype";
import { InstagramIcon, MapPinIcon } from "@/components/ui/icons";

const COLUMNS = [
  {
    title: "Prestations",
    links: [
      { href: "/kandylove#onglerie", label: "Prothésie ongulaire" },
      { href: "/kandylove#maquillage", label: "Maquillage" },
      { href: "/naftali", label: "Extensions de cils" },
      { href: "/rendez-vous", label: "Prendre rendez-vous" },
    ],
  },
  {
    title: "La maison",
    links: [
      { href: "/formations", label: "Formations professionnelles" },
      { href: "/a-propos", label: "À propos" },
      { href: "/mentions-legales", label: "Mentions légales" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-sand-deep bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logotype size="md" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-taupe">
              Showroom beauté &amp; centre de formation, sur rendez-vous, au cœur
              de Saint-Quentin.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="overline-label">{column.title}</p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-espresso/80 transition-colors duration-300 hover:text-bronze"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <p className="overline-label">Nous trouver</p>
            <ul className="mt-5 space-y-3 text-sm text-espresso/80">
              <li className="flex items-center gap-2.5">
                <MapPinIcon width={16} height={16} className="text-bronze" />
                {CONTACT.city} · {CONTACT.region}
              </li>
              <li>{CONTACT.scheduleLabel}</li>
              <li className="pt-1">
                <a
                  href={`https://instagram.com/${CONTACT.instagramKandylove}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors duration-300 hover:text-bronze"
                >
                  <InstagramIcon width={16} height={16} className="text-bronze" />
                  @{CONTACT.instagramKandylove}
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${CONTACT.instagramNaftali}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 transition-colors duration-300 hover:text-bronze"
                >
                  <InstagramIcon width={16} height={16} className="text-gold" />
                  @{CONTACT.instagramNaftali}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-sand-deep pt-6 text-[0.7rem] tracking-[0.12em] text-taupe uppercase md:flex-row">
          <p>© {new Date().getFullYear()} Maison Kanali — Tous droits réservés</p>
          <p>Sur rendez-vous uniquement</p>
        </div>
      </div>
    </footer>
  );
}
