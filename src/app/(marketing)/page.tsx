import { Hero } from "@/components/marketing/sections/Hero";
import { Manifesto } from "@/components/marketing/sections/Manifesto";
import { Benefits } from "@/components/marketing/sections/Benefits";
import { WhoItsFor } from "@/components/marketing/sections/WhoItsFor";
import { FoundersLetter } from "@/components/marketing/sections/FoundersLetter";
import { Membership } from "@/components/marketing/sections/Membership";
import { Faq } from "@/components/marketing/sections/Faq";
import { CtaBand } from "@/components/marketing/sections/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Benefits />
      <WhoItsFor />
      <FoundersLetter />
      <Membership />
      <Faq />
      <CtaBand />
    </>
  );
}
