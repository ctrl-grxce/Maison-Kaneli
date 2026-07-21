import Link from "next/link";

export default function NotFound() {
  return (
    <section className="halo-blush">
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-28 text-center md:py-36">
        <p className="overline-label">Erreur 404</p>
        <h1 className="font-display mt-5 max-w-xl text-4xl leading-[1.1] font-medium text-balance md:text-5xl">
          Cette page s&apos;est <em className="text-bronze">évaporée</em>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-taupe">
          Le lien que vous avez suivi n&apos;existe plus — mais la maison vous
          reste grande ouverte.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Retour à l&apos;accueil
          </Link>
          <Link href="/rendez-vous" className="btn btn-outline">
            Prendre rendez-vous
          </Link>
        </div>
      </div>
    </section>
  );
}
