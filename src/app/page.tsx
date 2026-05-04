import { Container } from "@/components/container"
import { H1, H2, H3, Body, Label } from "@/components/typography"
import { PubbyButton } from "@/components/button"

function ImagePlaceholder({
  className = "",
  label = "Image",
}: {
  className?: string
  label?: string
}) {
  return (
    <div
      className={`bg-[#252540] flex items-center justify-center ${className}`}
    >
      <span className="font-sans font-light text-xs text-cream/20 tracking-[0.3em] uppercase">
        {label}
      </span>
    </div>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative flex items-end min-h-screen overflow-hidden">
        <ImagePlaceholder className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />

        <Container className="relative z-10 pb-24 pt-40">
          <div className="max-w-3xl">
            <Label className="mb-6 block">La notte giusta, stasera</Label>
            <H1 className="mb-8">
              La tua città,
              <br />
              dopo il tramonto.
            </H1>
            <Body className="mb-12 max-w-lg">
              Scopri i migliori locali, bar e ristoranti della tua città.
              PUBBY ti guida ogni sera verso la scelta perfetta.
            </Body>
            <div className="flex flex-wrap gap-4">
              <PubbyButton variant="accent" size="lg">
                Scarica l&apos;app
              </PubbyButton>
              <PubbyButton variant="outline" size="lg">
                Per i locali
              </PubbyButton>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Design System Preview ── */}
      <section className="py-40 border-t border-cream/5">
        <Container>
          <div className="max-w-2xl mx-auto space-y-24">
            {/* Header */}
            <div>
              <Label className="mb-4 block">Design System</Label>
              <H2 className="mb-6">Componenti PUBBY</H2>
              <Body>
                Layout e componenti base. Le sezioni della homepage verranno
                sviluppate nella prossima fase.
              </Body>
            </div>

            {/* Palette */}
            <div className="space-y-4">
              <Label className="block">Palette</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    bg: "bg-night border border-cream/10",
                    hex: "#1a1a2e",
                    name: "Night",
                  },
                  { bg: "bg-primary", hex: "#ff2e63", name: "Accent" },
                  { bg: "bg-cream", hex: "#f5f0eb", name: "Cream" },
                  { bg: "bg-bordeaux", hex: "#6b1d2a", name: "Bordeaux" },
                ].map(({ bg, hex, name }) => (
                  <div key={name}>
                    <div className={`h-20 ${bg}`} />
                    <p className="font-sans font-semibold text-xs text-cream mt-2">
                      {name}
                    </p>
                    <p className="font-mono font-light text-[0.65rem] text-cream/40">
                      {hex}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tipografia */}
            <div className="space-y-6">
              <Label className="block">Tipografia</Label>
              <div className="space-y-4 border border-cream/5 p-6">
                <H1 className="!text-4xl">DM Serif Display — H1</H1>
                <H2 className="!text-2xl">DM Serif Display — H2</H2>
                <H3 className="!text-xl">DM Serif Display — H3</H3>
                <Body>
                  Inter 300 — testo corpo. Diretto, caldo, sofisticato ma
                  accessibile.
                </Body>
                <Label>Inter 600 uppercase — micro-CTA · Label</Label>
              </div>
            </div>

            {/* Pulsanti */}
            <div className="space-y-4">
              <Label className="block">Pulsanti</Label>
              <div className="flex flex-wrap gap-4 p-6 border border-cream/5">
                <PubbyButton variant="accent">Accent</PubbyButton>
                <PubbyButton variant="primaria">Primaria</PubbyButton>
                <PubbyButton variant="outline">Outline</PubbyButton>
              </div>
              <div className="flex flex-wrap gap-4 p-6 bg-cream/5">
                <PubbyButton variant="accent" size="sm">
                  Small
                </PubbyButton>
                <PubbyButton variant="outline" size="sm">
                  Small outline
                </PubbyButton>
                <PubbyButton variant="accent" size="lg">
                  Large
                </PubbyButton>
              </div>
            </div>

            {/* Placeholder immagine */}
            <div className="space-y-4">
              <Label className="block">Placeholder immagine</Label>
              <ImagePlaceholder className="aspect-video" />
              <div className="grid grid-cols-3 gap-3">
                <ImagePlaceholder className="aspect-square" label="Sq" />
                <ImagePlaceholder className="aspect-square" label="Sq" />
                <ImagePlaceholder className="aspect-square" label="Sq" />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
