"use client"

import { cn } from "@/lib/utils"
import { type ReactNode, type ButtonHTMLAttributes } from "react"

type Variant = "accent" | "primaria" | "outline"
type Size = "sm" | "default" | "lg"

interface PubbyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  accent:
    "bg-primary text-cream hover:bg-primary/80 border border-transparent",
  primaria:
    "bg-cream text-night hover:bg-cream/90 border border-transparent",
  outline:
    "bg-transparent text-cream border border-cream/30 hover:border-cream/60 hover:bg-cream/5",
}

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-5 text-[0.65rem]",
  default: "h-11 px-7 text-[0.7rem]",
  lg: "h-13 px-9 text-[0.75rem]",
}

export function PubbyButton({
  children,
  className,
  variant = "accent",
  size = "default",
  ...props
}: PubbyButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-sans font-semibold uppercase tracking-[0.15em] transition-all duration-200 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-night disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
