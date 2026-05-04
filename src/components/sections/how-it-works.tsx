"use client"

import { motion } from "framer-motion"
import { Container } from "@/components/container"
import { fadeUp, slideInLeft, slideInRight, stagger, viewportConfig } from "@/lib/motion"

const steps = [
  {
    num: "01",
    title: "Apri PUBBY",
    body: "Scegli la città, il quartiere, o lascia che sia il GPS a orientarti. PUBBY sa già dove sei e cosa c'è intorno.",
    imageLeft: false,
  },
  {
    num: "02",
    title: "Trova il tuo mood",
    body: "Vuoi qualcosa di tranquillo? Musica live? Street food fino a tardi? Tu dici, PUBBY filtra. Niente scroll infinito.",
    imageLeft: true,
  },
  {
    num: "03",
    title: "Esci, già prenotato.",
    body: "Il locale ti aspetta. Niente attese al telefono, niente sorprese. Solo la serata che ti meriti.",
    imageLeft: false,
  },
]

function GeometricPattern({ index }: { index: number }) {
  if (index === 0) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="480" height="320" fill="#1c1c32" />
        {/* Concentric circles */}
        {[160, 110, 70, 36].map((r, i) => (
          <circle
            key={r}
            cx="240" cy="160" r={r}
            fill="none"
            stroke={i === 3 ? "#ff2e63" : "#f5f0eb"}
            strokeWidth={i === 3 ? 0.8 : 0.4}
            strokeOpacity={i === 3 ? 0.45 : 0.1 + i * 0.04}
          />
        ))}
        {/* Crosshairs */}
        <line x1="0" y1="160" x2="480" y2="160" stroke="#f5f0eb" strokeWidth="0.3" strokeOpacity="0.07" />
        <line x1="240" y1="0" x2="240" y2="320" stroke="#f5f0eb" strokeWidth="0.3" strokeOpacity="0.07" />
        {/* Accent dot */}
        <circle cx="240" cy="160" r="4" fill="#ff2e63" fillOpacity="0.6" />
        {/* Small scattered dots */}
        {[[80,60],[400,80],[360,260],[120,240],[320,120],[160,200]].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1.5" fill="#f5f0eb" fillOpacity="0.15" />
        ))}
      </svg>
    )
  }
  if (index === 1) {
    return (
      <svg width="100%" height="100%" viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <rect width="480" height="320" fill="#1c1c32" />
        {/* Dot grid */}
        {Array.from({ length: 9 }).map((_, row) =>
          Array.from({ length: 13 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 40 + 20}
              cy={row * 36 + 18}
              r={1.2}
              fill="#f5f0eb"
              fillOpacity={0.12}
            />
          ))
        )}
        {/* Accent rectangle rotated */}
        <rect
          x="160" y="100" width="160" height="120"
          fill="none"
          stroke="#ff2e63" strokeWidth="0.7" strokeOpacity="0.4"
          transform="rotate(12 240 160)"
        />
        <rect
          x="180" y="115" width="120" height="90"
          fill="none"
          stroke="#f5f0eb" strokeWidth="0.3" strokeOpacity="0.12"
          transform="rotate(12 240 160)"
        />
        {/* Corner markers */}
        {[[0,0],[480,0],[480,320],[0,320]].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="3" fill="#f5f0eb" fillOpacity="0.08" />
        ))}
      </svg>
    )
  }
  return (
    <svg width="100%" height="100%" viewBox="0 0 480 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="480" height="320" fill="#1c1c32" />
      {/* Diagonal lines */}
      {Array.from({ length: 18 }).map((_, i) => (
        <line
          key={i}
          x1={i * 32 - 60} y1="0"
          x2={i * 32 + 260} y2="320"
          stroke="#f5f0eb" strokeWidth="0.35" strokeOpacity="0.09"
        />
      ))}
      {/* Diamond */}
      <polygon
        points="240,80 340,160 240,240 140,160"
        fill="none"
        stroke="#ff2e63" strokeWidth="0.8" strokeOpacity="0.4"
      />
      <polygon
        points="240,110 310,160 240,210 170,160"
        fill="none"
        stroke="#f5f0eb" strokeWidth="0.3" strokeOpacity="0.15"
      />
      {/* Center dot */}
      <circle cx="240" cy="160" r="3" fill="#ff2e63" fillOpacity="0.5" />
    </svg>
  )
}

export function HowItWorks() {
  return (
    <section className="py-40 border-t border-cream/5 overflow-hidden">
      <Container>
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={stagger}
          className="space-y-4 mb-32"
        >
          <motion.span
            variants={fadeUp}
            className="font-sans font-semibold text-[0.65rem] uppercase tracking-[0.2em] text-primary block"
          >
            Come funziona
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-tight tracking-tight max-w-xl"
          >
            Tre passi. Una serata.
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="space-y-36">
          {steps.map(({ num, title, body, imageLeft }, i) => (
            <motion.div
              key={num}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
              variants={stagger}
              className={[
                "grid md:grid-cols-2 gap-12 md:gap-20 items-center",
                imageLeft ? "md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1" : "",
              ].join(" ")}
            >
              {/* Text side */}
              <motion.div
                variants={imageLeft ? slideInRight : slideInLeft}
                className="space-y-6"
              >
                {/* Giant step number — cropped at top for editorial effect */}
                <div className="overflow-hidden" style={{ height: "6rem" }}>
                  <span
                    className="font-serif leading-none text-cream/6 block"
                    style={{ fontSize: "clamp(6rem,14vw,10rem)", marginTop: "-1.2rem" }}
                  >
                    {num}
                  </span>
                </div>

                <h3 className="font-serif text-3xl md:text-4xl text-cream leading-tight tracking-tight">
                  {title}
                </h3>
                <p className="font-sans font-light text-base leading-relaxed text-cream/65 max-w-sm">
                  {body}
                </p>

                {/* Thin accent line */}
                <div className="w-12 h-px bg-primary/50" />
              </motion.div>

              {/* Geometric image */}
              <motion.div
                variants={imageLeft ? slideInLeft : slideInRight}
                className="aspect-video overflow-hidden"
              >
                <GeometricPattern index={i} />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
