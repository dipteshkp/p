"use client"

import Link from "next/link"
import { Activity, Radio, TriangleAlert } from "lucide-react"

export function LandingHero() {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20">
          <Activity className="h-8 w-8 text-[#06b6d4]" />
        </div>
        <div className="p-3 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20">
          <Radio className="h-8 w-8 text-[#22d3ee]" />
        </div>
        <div className="p-3 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20">
          <TriangleAlert className="h-8 w-8 text-[#06b6d4]" />
        </div>
      </div>

      <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
        <span className="bg-gradient-to-r from-[#06b6d4] via-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent">
          Civil Monitoring
        </span>
        <br />
        <span className="text-[#e8ecf4]">Platform</span>
      </h1>

      <p className="text-lg md:text-xl text-[#94a3b8] mb-4 font-light tracking-wide">
        Structural Vibration &bull; Earthquake Detection &bull; Tilt Monitoring
      </p>

      <p className="text-sm text-[#64748b] mb-10 max-w-lg mx-auto leading-relaxed">
        Real-time sensor data analysis with professional-grade monitoring tools
        for civil engineering applications.
      </p>

      <Link
        href="/sensor"
        className="glow-button inline-flex items-center gap-3 bg-gradient-to-r from-[#06b6d4] to-[#0ea5e9] text-[#0b0f1a] font-semibold text-lg px-10 py-4 rounded-xl hover:brightness-110 transition-all duration-300"
      >
        <Activity className="h-5 w-5" />
        Launch Monitoring
      </Link>

      <div className="mt-16 flex items-center justify-center gap-8 text-[#64748b] text-xs">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
          Systems Operational
        </span>
        <span>v2.4.1</span>
        <span>60Hz Sampling</span>
      </div>
    </div>
  )
}
