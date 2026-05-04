"use client"

import { motion } from "framer-motion"
import { Container } from "@/components/container"
import { fadeUp, scaleIn, stagger, viewportConfig } from "@/lib/motion"

function PhoneMockup() {
  return (
    <div className="relative mx-auto" style={{ width: "clamp(160px, 22vw, 230px)" }}>
      {/* Phone outer frame */}
      <div className="relative bg-night border border-cream/15 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
        style={{ borderRadius: "2.5rem", aspectRatio: "9/19.5" }}
      >
        {/* Notch */}
        <div className="absolute top-3 inset-x-0 flex justify-center z-10">
          <div className="w-20 h-5 bg-night rounded-full border border-cream/10" />
        </div>

        {/* Screen content */}
        <div className="absolute inset-0 flex flex-col pt-12 pb-8 px-5 gap-4">
          {/* App header */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-serif text-base text-cream tracking-[0.18em]">PUBBY</span>
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
          </div>

          {/* Map placeholder */}
          <div className="flex-1 bg-[#252540] rounded relative overflow-hidden">
            {/* Subtle grid lines on map */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140">
              {[20,40,60,80].map(x => (
                <line key={`v${x}`} x1={x} y1="0" x2={x} y2="140" stroke="#f5f0eb" strokeWidth="0.3" strokeOpacity="0.07"/>
              ))}
              {[28,56,84,112].map(y => (
                <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#f5f0eb" strokeWidth="0.3" strokeOpacity="0.07"/>
              ))}
              {/* Pins */}
              <circle cx="38" cy="55" r="3" fill="#ff2e63" fillOpacity="0.8"/>
              <circle cx="62" cy="38" r="2" fill="#ff2e63" fillOpacity="0.5"/>
              <circle cx="55" cy="80" r="2" fill="#ff2e63" fillOpacity="0.5"/>
              <circle cx="28" cy="95" r="1.5" fill="#f5f0eb" fillOpacity="0.3"/>
            </svg>
          </div>

          {/* Card list */}
          <div className="space-y-2">
            {[0.9, 0.7, 0.5].map((op, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#252540] shrink-0" style={{ opacity: op }} />
                <div className="flex-1 space-y-1">
                  <div className="h-1.5 bg-cream/15 rounded-full" style={{ width: `${70 - i * 14}%` }} />
                  <div className="h-1 bg-cream/8 rounded-full" style={{ width: `${50 - i * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center">
          <div className="w-20 h-0.5 bg-cream/20 rounded-full" />
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute -bottom-8 inset-x-6 h-16 bg-primary/10 blur-3xl rounded-full pointer-events-none" />
    </div>
  )
}

function StoreBadge({ store }: { store: "apple" | "google" }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-3 bg-night hover:bg-[#252540] transition-colors duration-200 px-5 py-3 border border-night/60"
    >
      {store === "apple" ? (
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path
            d="M15.2 11.3c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-1.9-3.7-2-1.6-.1-3 .9-3.8.9-.8 0-2-.9-3.3-.9C4.5 5.4 2.5 6.6 1.4 8.6c-2.2 3.8-.6 9.5 1.6 12.6 1 1.5 2.3 3.2 3.8 3.1 1.6-.1 2.1-1 3.9-1 1.9 0 2.4 1 4.1.9 1.7-.1 2.7-1.6 3.7-3.1.7-1 1.1-1.9 1.4-2.7-3.4-1.3-3.3-4.9 0-6.5L15.2 11.3z"
            fill="#1a1a2e"
          />
          <path
            d="M13.3 3.7c.8-1 1.4-2.4 1.2-3.7-1.2 0-2.6.8-3.4 1.8-.7.8-1.4 2.2-1.2 3.5 1.3.1 2.6-.6 3.4-1.6z"
            fill="#1a1a2e"
          />
        </svg>
      ) : (
        <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
          <path d="M.4.9C.2 1.2 0 1.6 0 2.3V17.7c0 .7.2 1.1.4 1.4l.1.1 8.7-8.7v-.2L.4.9z" fill="#1a1a2e"/>
          <path d="M12.3 13.5l-2.9-2.9V11l2.9-2.9.1.1 3.5 1.9c1 .6 1 1.5 0 2.1l-3.6 2.3z" fill="#1a1a2e"/>
          <path d="M12.4 13.4L9.2 10.2.4 19c.4.3.9.4 1.6.1l10.4-5.8-.1.1z" fill="#1a1a2e"/>
          <path d="M12.4 7L2 1.1C1.3.8.8.9.4 1.2l8.8 8.8 3.2-3z" fill="#1a1a2e"/>
        </svg>
      )}
      <div className="text-left">
        <p className="font-sans text-[0.58rem] text-night/55 leading-none mb-0.5 uppercase tracking-wide">
          Disponibile su
        </p>
        <p className="font-sans font-semibold text-night text-sm leading-none">
          {store === "apple" ? "App Store" : "Google Play"}
        </p>
      </div>
    </button>
  )
}

export function DownloadApp() {
  return (
    <section className="py-40 bg-cream overflow-hidden">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={stagger}
          className="flex flex-col lg:flex-row items-center gap-24 lg:gap-16 xl:gap-32"
        >
          {/* Phone mockup — right on desktop */}
          <motion.div
            variants={scaleIn}
            className="lg:order-2 flex-shrink-0 w-full max-w-[220px] lg:max-w-[240px] mx-auto"
          >
            <PhoneMockup />
          </motion.div>

          {/* Text — left on desktop */}
          <motion.div
            variants={stagger}
            className="lg:order-1 space-y-8 text-center lg:text-left flex-1"
          >
            <motion.span
              variants={fadeUp}
              className="font-sans font-semibold text-[0.65rem] uppercase tracking-[0.2em] text-night/40 block"
            >
              Download gratuito
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-night leading-tight tracking-tight"
            >
              Tutta la notte
              <br />
              in tasca.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-sans font-light text-base md:text-lg leading-relaxed text-night/65 max-w-sm mx-auto lg:mx-0"
            >
              PUBBY è gratis. Scaricalo adesso e inizia a scoprire la tua
              città come non l&apos;avevi mai vista.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
            >
              <StoreBadge store="apple" />
              <StoreBadge store="google" />
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}
