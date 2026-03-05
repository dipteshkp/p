"use client"

import { Play, Square, Download } from "lucide-react"
import type { MonitoringStatus } from "./dashboard-content"

interface ControlButtonsProps {
  status: MonitoringStatus
  onStart: () => void
  onStop: () => void
  onExport: () => void
}

export function ControlButtons({ status, onStart, onStop, onExport }: ControlButtonsProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-4">
      <button
        onClick={onStart}
        disabled={status === "Monitoring"}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full md:w-auto
          bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/20
          hover:bg-[#22c55e]/25 hover:border-[#22c55e]/40
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#22c55e]/15 disabled:hover:border-[#22c55e]/20"
      >
        <Play className="h-4 w-4" />
        Start
      </button>

      <button
        onClick={onStop}
        disabled={status !== "Monitoring"}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full md:w-auto
          bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/20
          hover:bg-[#ef4444]/25 hover:border-[#ef4444]/40
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#ef4444]/15 disabled:hover:border-[#ef4444]/20"
      >
        <Square className="h-4 w-4" />
        Stop
      </button>

      <button
        onClick={onExport}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 w-full md:w-auto
          bg-[#06b6d4]/15 text-[#22d3ee] border border-[#06b6d4]/20
          hover:bg-[#06b6d4]/25 hover:border-[#06b6d4]/40"
      >
        <Download className="h-4 w-4" />
        Export Data
      </button>
    </div>
  )
}
