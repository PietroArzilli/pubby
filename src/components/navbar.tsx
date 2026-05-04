"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Container } from "@/components/container"
import { PubbyButton } from "@/components/button"

const navLinks = [
  { href: "#come-funziona", label: "Come funziona" },
  { href: "#per-i-locali", label: "Per i locali" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={[
        "fixed top-0 inset-x-0 z-50 transition-colors duration-300",
        scrolled
          ? "bg-night/92 backdrop-blur-md border-b border-cream/5"
          : "bg-transparent",
      ].join(" ")}
    >
      <Container>
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-xl md:text-2xl text-cream tracking-[0.2em] hover:text-primary transition-colors duration-200"
          >
            PUBBY
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-sans font-light text-sm text-cream/60 hover:text-cream transition-colors duration-200 tracking-wide"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <PubbyButton variant="accent" size="sm">
              Scarica l&apos;app
            </PubbyButton>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                className="text-cream/70 hover:text-cream transition-colors p-1"
                aria-label="Apri menu"
              >
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="bg-night border-l border-cream/5 w-4/5 sm:w-80 pt-16"
              >
                <nav className="flex flex-col gap-8 px-6 pt-4">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="font-serif text-2xl text-cream hover:text-primary transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  ))}
                  <div className="pt-4">
                    <PubbyButton variant="accent" className="w-full">
                      Scarica l&apos;app
                    </PubbyButton>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </motion.header>
  )
}
