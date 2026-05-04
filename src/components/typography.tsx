import { cn } from "@/lib/utils"
import { type ReactNode } from "react"

interface TypoProps {
  children: ReactNode
  className?: string
}

export function H1({ children, className }: TypoProps) {
  return (
    <h1
      className={cn(
        "font-serif text-5xl md:text-7xl lg:text-[6.5rem] leading-none tracking-tight text-cream",
        className
      )}
    >
      {children}
    </h1>
  )
}

export function H2({ children, className }: TypoProps) {
  return (
    <h2
      className={cn(
        "font-serif text-3xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-cream",
        className
      )}
    >
      {children}
    </h2>
  )
}

export function H3({ children, className }: TypoProps) {
  return (
    <h3
      className={cn(
        "font-serif text-2xl md:text-3xl leading-snug text-cream",
        className
      )}
    >
      {children}
    </h3>
  )
}

export function Body({ children, className }: TypoProps) {
  return (
    <p
      className={cn(
        "font-sans font-light text-base md:text-lg leading-relaxed text-cream/75",
        className
      )}
    >
      {children}
    </p>
  )
}

export function Label({ children, className }: TypoProps) {
  return (
    <span
      className={cn(
        "font-sans font-semibold text-[0.65rem] uppercase tracking-[0.18em] text-cream/50",
        className
      )}
    >
      {children}
    </span>
  )
}
