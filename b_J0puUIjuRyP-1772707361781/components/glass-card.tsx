"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  interactive?: boolean
}

export function GlassCard({ children, className, onClick, interactive = false }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card rounded-2xl p-6 transition-all duration-300",
        interactive && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === "Enter" || e.key === " ") onClick?.() } : undefined}
    >
      {children}
    </div>
  )
}
