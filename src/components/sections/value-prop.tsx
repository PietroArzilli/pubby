"use client"

import { motion } from "framer-motion"
import { MapPin, CalendarCheck, Zap } from "lucide-react"
import { Container } from "@/components/container"
import { fadeUp, stagger, viewportConfig } from "@/lib/motion"

const cards = [
  {
    icon: MapPin,
    title: "Esplora",
    description:
      "Sfoglia centinaia di locali filtrati per zona, tipo e mood. Non cercavi niente di specifico? Meglio così.",
    offset: false,
  },
  {
    icon: CalendarCheck,
    title: "Prenota",
    description:
      "Tavoli, aperitivi, serate private. Tutto confermato in tre tap, senza telefonate e senza attese.",
    offset: true,
  },
  {
    icon: Zap,
    title: "Vivi",
    description:
      "Ogni sera è diversa. PUBBY ti suggerisce cosa c'è di nuovo in città, personalizzato solo per te.",
    offset: false,
  },
]

export function ValueProposition() {
  return (
    <section className="py-40 overflow-hidden">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={stagger}
          className="space-y-20"
        >
          {/* Header */}
          <div className="space-y-4 max-w-2xl">
            <motion.span
              variants={fadeUp}
              className="font-sans font-semibold text-[0.65rem] uppercase tracking-[0.2em] text-primary block"
            >
              Perché PUBBY
            </motion.span>
            <motion.h2
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-tight tracking-tight"
            >
              Semplice quanto uscire dalla porta.
            </motion.h2>
          </div>

          {/* Cards */}
          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
          >
            {cards.map(({ icon: Icon, title, description, offset }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className={[
                  "group relative border border-bordeaux/35 p-8 md:p-10 transition-all duration-500",
                  "hover:border-primary/30 hover:shadow-[0_0_40px_-12px_rgba(255,46,99,0.18)]",
                  offset ? "md:translate-y-10" : "",
                ].join(" ")}
              >
                {/* Corner accent — appears on hover */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/0 group-hover:border-primary/50 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/0 group-hover:border-bordeaux/50 transition-all duration-500" />

                <div className="mb-8">
                  <Icon
                    className="w-6 h-6 text-primary"
                    strokeWidth={1.25}
                  />
                </div>

                <h3 className="font-serif text-2xl text-cream mb-4 tracking-tight">
                  {title}
                </h3>

                <p className="font-sans font-light text-sm leading-relaxed text-cream/60">
                  {description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
