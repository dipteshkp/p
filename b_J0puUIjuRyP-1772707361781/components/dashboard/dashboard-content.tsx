"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardTopBar } from "./dashboard-top-bar"
import { MetricsPanel } from "./metrics-panel"
import { LiveChart } from "./live-chart"
import { ControlButtons } from "./control-buttons"
import { useSensorSimulation } from "@/hooks/use-sensor-simulation"

export type MonitoringMode = "structural" | "earthquake" | "tilt"
export type MonitoringStatus = "Idle" | "Monitoring" | "Stopped"
export type HardwareSource = "phone" | "external"

// 1. We move the main logic into an "Inner" component
function DashboardInner() {
  const searchParams = useSearchParams()
  const mode = (searchParams.get("mode") as MonitoringMode) || "structural"
  const source = (searchParams.get("source") as HardwareSource) || "phone"

  const {
    status,
    metrics,
    chartData,
    error,
    isConnected,
    connectExternalDevice,
    startMonitoring,
    stopMonitoring,
    exportData,
  } = useSensorSimulation(mode, source)

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-md">
          {error}
        </div>
      )}

      <DashboardTopBar 
        mode={mode} 
        status={status} 
        source={source}
        isConnected={isConnected}
        onConnect={connectExternalDevice}
      />
      <MetricsPanel mode={mode} metrics={metrics} />
      <LiveChart chartData={chartData} />
      <ControlButtons
        status={status}
        onStart={startMonitoring}
        onStop={stopMonitoring}
        onExport={exportData}
      />
    </div>
  )
}

// 2. We wrap the inner component in a Suspense boundary for Vercel!
export function DashboardContent() {
  return (
    <main className="animated-bg min-h-screen px-4 py-6">
      <Suspense fallback={<div className="text-center text-[#94a3b8] py-10">Loading dashboard...</div>}>
        <DashboardInner />
      </Suspense>
    </main>
  )
}
