"use client"

import { BackButton } from "@/components/back-button"
import type { MonitoringMode, MonitoringStatus } from "./dashboard-content"
import { Button } from "@/components/ui/button"
import { Usb } from "lucide-react"

const modeLabels: Record<MonitoringMode, string> = {
  structural: "Structural Vibration",
  earthquake: "Earthquake Detection",
  tilt: "Tilt Monitoring",
}

const statusStyles: Record<MonitoringStatus, { bg: string; text: string; dot: string }> = {
  Idle: { bg: "bg-[#eab308]/10", text: "text-[#facc15]", dot: "bg-[#facc15]" },
  Monitoring: { bg: "bg-[#22c55e]/10", text: "text-[#4ade80]", dot: "bg-[#4ade80]" },
  Stopped: { bg: "bg-[#ef4444]/10", text: "text-[#f87171]", dot: "bg-[#f87171]" },
}

interface DashboardTopBarProps {
  mode: MonitoringMode
  status: MonitoringStatus
  isConnected?: boolean
  onConnect?: () => void
}

export function DashboardTopBar({ mode, status, isConnected, onConnect }: DashboardTopBarProps) {
  const style = statusStyles[status]

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <BackButton href="/mode" label="Mode Selection" />
        <h1 className="text-2xl md:text-3xl font-bold text-[#e8ecf4]">
          Civil Monitoring Dashboard
        </h1>
        <p className="text-sm text-[#94a3b8]">
          Mode: {modeLabels[mode]}
        </p>
      </div>
      
      <div className="flex items-center gap-4 self-start md:self-auto">
        {!isConnected && (
          <Button onClick={onConnect} variant="outline" className="gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border-blue-600/50">
            <Usb className="w-4 h-4" />
            Connect Arduino
          </Button>
        )}

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${style.bg}`}>
          <span className={`h-2 w-2 rounded-full ${style.dot} ${status === "Monitoring" ? "animate-pulse" : ""}`} />
          <span className={`text-sm font-medium ${style.text}`}>{status}</span>
        </div>
      </div>
    </div>
  )
}
