import Link from "next/link";

/**
 * Barre de réservation fixe en bas d'écran — mobile uniquement.
 * Garantit un accès permanent au rendez-vous sur les pages prestations.
 */
export function MobileBookBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-deep bg-ivory/92 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <Link href="/rendez-vous" className="btn btn-primary w-full">
        Prendre rendez-vous
      </Link>
    </div>
  );
}
