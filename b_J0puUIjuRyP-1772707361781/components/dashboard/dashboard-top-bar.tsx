"use client"

import { BackButton } from "@/components/back-button"
import type { MonitoringMode, MonitoringStatus, HardwareSource } from "./dashboard-content"
import { Button } from "@/components/ui/button"
import { Usb,Wifi } from "lucide-react"

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
  source: HardwareSource
  isConnected?: boolean
  onConnectUsb?: () => void
  onConnectWifi?: () => void
}

export function DashboardTopBar({ mode, status, source, isConnected, onConnectUsb, onConnectWifi }: DashboardTopBarProps) {
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
        {source === "external" && !isConnected && (
          <div className="flex gap-3">
            <Button 
              onClick={onConnectUsb} 
              className="gap-2 bg-[#06b6d4] hover:bg-[#22d3ee] text-[#0f172a] font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all"
            >
              <Usb className="w-4 h-4" /> USB
            </Button>
            <Button 
              onClick={onConnectWifi} 
              className="gap-2 bg-[#8b5cf6] hover:bg-[#a78bfa] text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
            >
              <Wifi className="w-4 h-4" /> Wi-Fi
            </Button>
          </div>
        )}

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${style.bg}`}>
          <span className={`h-2 w-2 rounded-full ${style.dot} ${status === "Monitoring" ? "animate-pulse" : ""}`} />
          <span className={`text-sm font-medium ${style.text}`}>{status}</span>
        </div>
      </div>
    </div>
  )
}
