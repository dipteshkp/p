"use client"

import { Activity, Gauge } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import type { MonitoringMode } from "./dashboard-content"

interface MetricsPanelProps {
  mode: MonitoringMode
  metrics: {
    primary: number
    secondary: number | string
  }
}

const modeConfig: Record<
  MonitoringMode,
  {
    primaryLabel: string
    primaryUnit: string
    secondaryLabel: string
    secondaryUnit: string
  }
> = {
  structural: {
    primaryLabel: "RMS Acceleration",
    primaryUnit: "m/s\u00B2",
    secondaryLabel: "Peak Acceleration",
    secondaryUnit: "m/s\u00B2",
  },
  earthquake: {
    primaryLabel: "Acceleration Magnitude",
    primaryUnit: "m/s\u00B2",
    secondaryLabel: "Event Counter",
    secondaryUnit: "events",
  },
  tilt: {
    primaryLabel: "Tilt Angle",
    primaryUnit: "\u00B0",
    secondaryLabel: "Stability",
    secondaryUnit: "",
  },
}

export function MetricsPanel({ mode, metrics }: MetricsPanelProps) {
  const config = modeConfig[mode]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20">
          <Activity className="h-6 w-6 text-[#06b6d4]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-medium">
            {config.primaryLabel}
          </span>
          <span className="text-3xl font-bold text-[#e8ecf4] tabular-nums">
            {typeof metrics.primary === "number"
              ? metrics.primary.toFixed(4)
              : metrics.primary}
          </span>
          <span className="text-xs text-[#64748b]">{config.primaryUnit}</span>
        </div>
      </GlassCard>

      <GlassCard className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20">
          <Gauge className="h-6 w-6 text-[#22d3ee]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[#94a3b8] uppercase tracking-wider font-medium">
            {config.secondaryLabel}
          </span>
          <span className="text-3xl font-bold text-[#e8ecf4] tabular-nums">
            {typeof metrics.secondary === "number"
              ? (metrics.secondary as number).toFixed(4)
              : metrics.secondary}
          </span>
          <span className="text-xs text-[#64748b]">{config.secondaryUnit}</span>
        </div>
      </GlassCard>
    </div>
  )
}
