import { Hero } from "@/components/home/Hero";
import { TwoHouses } from "@/components/home/TwoHouses";
import { SignatureServices } from "@/components/home/SignatureServices";
import { Experience } from "@/components/home/Experience";
import { Founders } from "@/components/home/Founders";
import { CtaBand } from "@/components/home/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TwoHouses />
      <SignatureServices />
      <Experience />
      <Founders />
      <CtaBand />
    </>
  );
}
