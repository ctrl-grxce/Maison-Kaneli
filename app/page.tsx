/* Regénérée chaque jour : le tarif promo des cartes signature expire seul. */
export const revalidate = 86400;

import type { Metadata } from "next";
import { PAGES, pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { TwoHouses } from "@/components/home/TwoHouses";
import { SignatureServices } from "@/components/home/SignatureServices";
import { Realisations } from "@/components/home/Realisations";
import { Experience } from "@/components/home/Experience";
import { Founders } from "@/components/home/Founders";
import { CtaBand } from "@/components/home/CtaBand";

export const metadata: Metadata = pageMetadata(PAGES.accueil);

export default function HomePage() {
  return (
    <>
      <Hero />
      <TwoHouses />
      <SignatureServices />
      <Realisations />
      <Experience />
      <Founders />
      <CtaBand />
    </>
  );
}
