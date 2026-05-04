import { cn } from "@/lib/utils"
import React, { type ReactNode } from "react"

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: React.ElementType
}

export function Container({
  children,
  className,
  as: As = "div",
}: ContainerProps) {
  return (
    <As
      className={cn(
        "mx-auto w-full max-w-7xl px-6 md:px-10 lg:px-16",
        className
      )}
    >
      {children}
    </As>
  )
}
