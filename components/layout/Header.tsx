"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { CONTACT } from "@/lib/config";
import { Logotype } from "@/components/ui/Logotype";
import { CloseIcon, InstagramIcon, MenuIcon } from "@/components/ui/icons";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/kandylove", label: "Kandylove Beauty" },
  { href: "/naftali", label: "Naftali" },
  { href: "/formations", label: "Formations" },
  { href: "/a-propos", label: "À propos" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* Le portail nécessite le DOM : on attend le montage côté client. */
  useEffect(() => setMounted(true), []);

  /* Ferme le menu à chaque navigation et bloque le scroll quand il est ouvert. */
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  /* Fermeture au clavier (Échap). */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  /*
   * Le menu mobile est rendu dans <body> via un portail : un ancêtre avec
   * backdrop-filter (le header) deviendrait sinon le conteneur du
   * position:fixed et le voile plein écran serait rogné à sa hauteur.
   */
  const mobileMenu = (
    <div
      className={cn(
        "fixed inset-0 z-[70] flex flex-col bg-ivory transition-opacity duration-500 lg:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-sand-deep/70 px-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
          className="-ml-2 flex h-11 w-11 items-center justify-center text-espresso"
        >
          <CloseIcon width={22} height={22} />
        </button>
        <Logotype size="sm" />
        <span className="w-9" aria-hidden />
      </div>

      <nav
        aria-label="Menu mobile"
        className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-8 py-6"
      >
        <ul className="space-y-1.5">
          {NAV_LINKS.map((link, index) => (
            <li
              key={link.href}
              className={cn(
                "transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: open ? `${120 + index * 60}ms` : "0ms" }}
            >
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-display block py-2.5 text-[2rem] leading-tight font-medium",
                  isActive(link.href) ? "text-bronze italic" : "text-espresso",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            "mt-10 transition-all delay-500 duration-500",
            open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
          )}
        >
          <Link
            href="/rendez-vous"
            onClick={() => setOpen(false)}
            className="btn btn-primary w-full"
          >
            Prendre rendez-vous
          </Link>
        </div>
      </nav>

      <div className="flex shrink-0 items-center justify-between border-t border-sand-deep px-8 py-5 text-[0.68rem] tracking-[0.16em] text-taupe uppercase">
        <span>{CONTACT.scheduleLabel}</span>
        <a
          href={`https://instagram.com/${CONTACT.instagramKandylove}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram Kandylove Beauty"
          className="text-bronze"
        >
          <InstagramIcon width={18} height={18} />
        </a>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-sand-deep/70 bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-[4.5rem] md:px-8">
        {/* Burger — mobile uniquement */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          className="-ml-2 flex h-11 w-11 items-center justify-center text-espresso lg:hidden"
        >
          <MenuIcon width={22} height={22} />
        </button>

        <Link
          href="/"
          aria-label="Maison Kanali — accueil"
          className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
        >
          <Logotype size="md" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "relative pb-1.5 text-[0.72rem] tracking-[0.18em] uppercase transition-colors duration-300",
                    isActive(link.href)
                      ? "text-espresso"
                      : "text-taupe hover:text-espresso",
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-px origin-left bg-bronze transition-transform duration-500",
                      isActive(link.href) ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link href="/rendez-vous" className="btn btn-primary hidden lg:inline-flex">
          Prendre rendez-vous
        </Link>

        {/* CTA compact — mobile */}
        <Link
          href="/rendez-vous"
          className="-mr-1 text-[0.68rem] tracking-[0.18em] text-bronze uppercase underline-offset-4 hover:underline lg:hidden"
        >
          Réserver
        </Link>
      </div>

      {mounted ? createPortal(mobileMenu, document.body) : null}
    </header>
  );
}
