import type { Metadata } from "next";
import { GestionApp } from "@/components/gestion/GestionApp";

/** Espace privé de Kandy & Nafi — jamais indexé, jamais mis en avant. */
export const metadata: Metadata = {
  title: "Espace de gestion",
  robots: { index: false, follow: false },
};

export default function GestionPage() {
  return (
    <section className="min-h-[80vh] bg-ivory">
      <div className="mx-auto max-w-3xl px-4 pt-10 pb-20 md:px-8 md:pt-14">
        <GestionApp />
      </div>
    </section>
  );
}
