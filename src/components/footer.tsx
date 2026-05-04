import Link from "next/link"
import { Container } from "@/components/container"

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/termini", label: "Termini" },
  { href: "/contatti", label: "Contatti" },
]

export function Footer() {
  return (
    <footer className="border-t border-cream/5 py-12">
      <Container>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-serif text-xl text-cream tracking-[0.2em]">
            PUBBY
          </span>

          <p className="font-sans font-light text-xs text-cream/30 text-center tracking-wide">
            © {new Date().getFullYear()} PUBBY. Tutti i diritti riservati.
          </p>

          <nav className="flex items-center gap-6">
            {footerLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-sans text-xs text-cream/35 hover:text-cream/70 transition-colors duration-200 tracking-wide"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  )
}
