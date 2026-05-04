"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Container } from "@/components/container"
import { PubbyButton } from "@/components/button"
import { fadeUp, stagger, viewportConfig } from "@/lib/motion"

const inputBase =
  "w-full bg-transparent border border-cream/15 focus:border-cream/50 px-4 py-3 text-cream placeholder-cream/25 font-sans font-light text-sm outline-none transition-colors duration-200"

export function B2BContact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Richiesta partnership — ${form.name}`)
    const body = encodeURIComponent(
      `Nome locale: ${form.name}\nEmail: ${form.email}\n\n${form.message || "Nessun messaggio aggiuntivo."}`
    )
    window.open(`mailto:info@pubby.app?subject=${subject}&body=${body}`)
  }

  return (
    <section className="py-40 bg-bordeaux overflow-hidden relative">
      {/* Subtle texture — large faint circle */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full border border-cream/5 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full border border-cream/5 pointer-events-none"
        aria-hidden="true"
      />

      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          variants={stagger}
          className="grid lg:grid-cols-2 gap-20 items-start"
        >
          {/* Left — copy */}
          <div className="space-y-8">
            <motion.span
              variants={fadeUp}
              className="font-sans font-semibold text-[0.65rem] uppercase tracking-[0.2em] text-cream/40 block"
            >
              Per i locali
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-cream leading-tight tracking-tight"
            >
              Porta PUBBY
              <br />
              nel tuo locale.
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-sans font-light text-base leading-relaxed text-cream/65 max-w-sm"
            >
              Entra nella rete PUBBY e raggiungi migliaia di persone che ogni
              sera cercano un posto come il tuo. Zero commissioni sui tavoli
              prenotati il primo mese.
            </motion.p>

            {/* Stats row */}
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 gap-6 pt-4 border-t border-cream/10"
            >
              {[
                { value: "12k+", label: "utenti attivi" },
                { value: "240+", label: "locali partner" },
              ].map(({ value, label }) => (
                <motion.div key={label} variants={fadeUp}>
                  <p className="font-serif text-3xl text-cream">{value}</p>
                  <p className="font-sans font-light text-xs text-cream/45 uppercase tracking-widest mt-1">
                    {label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right — form */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="block font-sans font-semibold text-[0.6rem] uppercase tracking-[0.18em] text-cream/40 mb-2">
                Nome del locale
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className={inputBase}
                placeholder="Es. Osteria dei Navigli"
              />
            </div>

            <div>
              <label className="block font-sans font-semibold text-[0.6rem] uppercase tracking-[0.18em] text-cream/40 mb-2">
                Email di contatto
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className={inputBase}
                placeholder="info@iltuolocale.it"
              />
            </div>

            <div>
              <label className="block font-sans font-semibold text-[0.6rem] uppercase tracking-[0.18em] text-cream/40 mb-2">
                Messaggio (opzionale)
              </label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                className={`${inputBase} resize-none`}
                placeholder="Raccontaci del tuo locale, quanti coperti avete, che tipo di serata offrite..."
              />
            </div>

            <div className="pt-2">
              <PubbyButton
                variant="accent"
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
              >
                Invia richiesta
              </PubbyButton>
            </div>

            <p className="font-sans font-light text-[0.65rem] text-cream/30 leading-relaxed">
              Ti risponderemo entro 24 ore. Niente spam, solo PUBBY.
            </p>
          </motion.form>
        </motion.div>
      </Container>
    </section>
  )
}
