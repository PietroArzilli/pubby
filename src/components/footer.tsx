import Link from "next/link"
import { Container } from "@/components/container"

const columns = [
  {
    heading: null,
    brand: true,
    links: [],
  },
  {
    heading: "Link veloci",
    brand: false,
    links: [
      { href: "#come-funziona", label: "Come funziona" },
      { href: "#esplora", label: "About PUBBY" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    heading: "Legale",
    brand: false,
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/termini", label: "Termini d'uso" },
      { href: "/cookie", label: "Cookie" },
    ],
  },
  {
    heading: "Contatti",
    brand: false,
    links: [
      { href: "mailto:info@pubby.app", label: "info@pubby.app" },
      { href: "#", label: "Instagram" },
      { href: "#", label: "TikTok" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-night relative">
      {/* Bordeaux top rule */}
      <div className="h-px w-full bg-bordeaux/70" />

      <Container className="py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1 — Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <span className="font-serif text-xl text-cream tracking-[0.2em] block">
              PUBBY
            </span>
            <p className="font-sans font-light text-xs leading-relaxed text-cream/40 max-w-[180px]">
              La tua città, dopo il tramonto.
            </p>
          </div>

          {/* Columns 2–4 — Link groups */}
          {columns.slice(1).map(({ heading, links }) => (
            <div key={heading} className="space-y-4">
              <p className="font-sans font-semibold text-[0.6rem] uppercase tracking-[0.18em] text-cream/30">
                {heading}
              </p>
              <nav className="flex flex-col gap-3">
                {links.map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="font-sans font-light text-xs text-cream/45 hover:text-cream/80 transition-colors duration-200 tracking-wide"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-cream/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans font-light text-[0.65rem] text-cream/25 tracking-wide">
            © {new Date().getFullYear()} PUBBY. Tutti i diritti riservati.
          </p>
          <p className="font-sans font-light text-[0.65rem] text-cream/20 tracking-wide">
            Fatto con cura a Milano.
          </p>
        </div>
      </Container>
    </footer>
  )
}
