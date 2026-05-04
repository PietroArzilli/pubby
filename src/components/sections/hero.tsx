"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Container } from "@/components/container"
import { PubbyButton } from "@/components/button"

const ease = [0.25, 0.1, 0.25, 1] as const

const child = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease, delay } },
})

const labelChild = (delay = 0) => ({
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease, delay } },
})

export function HeroSection() {
  return (
    <section className="relative flex flex-col justify-end min-h-screen overflow-hidden">
      {/* Background photo */}
      <Image
        src="https://images.unsplash.com/photo-1519671282422-b44660ead0a7?w=1200"
        alt="Vita notturna urbana"
        fill
        priority
        className="object-cover object-center"
        quality={90}
      />

      {/* Overlay layers */}
      <div className="absolute inset-0 bg-[#1a1a2e]/62" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-night/40 to-transparent" />

      <Container className="relative z-10 pb-28 pt-40">
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Eyebrow label */}
          <motion.span
            variants={labelChild(0.2)}
            className="font-sans font-semibold text-[0.65rem] uppercase tracking-[0.2em] text-primary block mb-8"
          >
            Scopri la tua città di notte
          </motion.span>

          {/* Headline — presented as 3 options, using option A */}
          <motion.h1
            variants={child(0.35)}
            className="font-serif text-[clamp(3rem,10vw,7.5rem)] leading-[0.95] tracking-tight text-cream mb-8"
          >
            La città non finisce
            <br />
            al tramonto.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={child(0.5)}
            className="font-sans font-light text-base md:text-lg leading-relaxed text-cream/70 mb-12 max-w-lg"
          >
            PUBBY raccoglie i migliori locali, bar e ristoranti della tua
            città. In pochi tap, sai già dove inizia la serata.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={labelChild(0.65)} className="flex flex-wrap gap-4">
            <PubbyButton variant="accent" size="lg">
              Scarica PUBBY
            </PubbyButton>
            <PubbyButton variant="outline" size="lg">
              Sei un locale? Scopri di più
            </PubbyButton>
          </motion.div>
        </motion.div>
      </Container>

      {/* Bottom fade into page */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-night to-transparent pointer-events-none" />
    </section>
  )
}
