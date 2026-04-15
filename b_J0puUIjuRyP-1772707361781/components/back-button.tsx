"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BackButtonProps {
  href: string
  label?: string
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    // <Link
    //   href={href}
    //   className="inline-flex items-center gap-2 text-[#94a3b8] hover:text-[#22d3ee] transition-colors duration-200 group"
    // >
      <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
      <span className="text-sm font-medium">{label}</span>
    // </Link>
  )
}
