"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Activity, Radio, TriangleAlert } from "lucide-react"
import { GlassCard } from "@/components/glass-card"

const modes = [
  {
    id: "structural",
    title: "Structural Vibration Monitoring",
    description:
      "Monitor building and bridge vibrations in real-time. Detect resonance frequencies and structural anomalies for preventive maintenance.",
    icon: Activity,
    color: "#06b6d4",
    metrics: "RMS & Peak Acceleration",
  },
  {
    id: "earthquake",
    title: "Earthquake Monitoring Node",
    description:
      "Deploy as a seismic detection node. Track ground acceleration magnitude and trigger event counters for earthquake early warning systems.",
    icon: Radio,
    color: "#22d3ee",
    metrics: "Magnitude & Event Count",
  },
  {
    id: "tilt",
    title: "Tilt Monitoring System",
    description:
      "Precision tilt angle measurement for slope stability, retaining walls, and construction site monitoring with stability classification.",
    icon: TriangleAlert,
    color: "#0ea5e9",
    metrics: "Tilt Angle & Stability",
  },
]

function ModeSelectionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Read the source from the previous page, default to phone if missing
  const source = searchParams.get("source") || "phone"

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <GlassCard
            key={mode.id}
            interactive
            onClick={() => router.push(`/dashboard?mode=${mode.id}&source=${source}`)}
            className="flex flex-col items-center text-center gap-4 py-10"
          >
            <div
              className="p-4 rounded-2xl border"
              style={{
                backgroundColor: `${mode.color}15`,
                borderColor: `${mode.color}30`,
              }}
            >
              <Icon className="h-10 w-10" style={{ color: mode.color }} />
            </div>
            <h2 className="text-lg font-semibold text-[#e8ecf4]">{mode.title}</h2>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              {mode.description}
            </p>
            <span
              className="text-xs font-medium mt-2 px-3 py-1 rounded-full"
              style={{
                color: mode.color,
                backgroundColor: `${mode.color}15`,
              }}
            >
              {mode.metrics}
            </span>
          </GlassCard>
        )
      })}
    </div>
  )
}

export function ModeSelection() {
  return (
    <Suspense fallback={<div className="text-center text-[#94a3b8] py-10">Loading modes...</div>}>
      <ModeSelectionContent />
    </Suspense>
  )
}
