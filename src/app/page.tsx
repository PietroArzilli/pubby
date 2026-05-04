import { HeroSection } from "@/components/sections/hero"
import { ValueProposition } from "@/components/sections/value-prop"
import { HowItWorks } from "@/components/sections/how-it-works"
import { DownloadApp } from "@/components/sections/download-app"
import { B2BContact } from "@/components/sections/b2b-contact"

export default function Home() {
  return (
    <>
      <HeroSection />
      <ValueProposition />
      <HowItWorks />
      <DownloadApp />
      <B2BContact />
    </>
  )
}
