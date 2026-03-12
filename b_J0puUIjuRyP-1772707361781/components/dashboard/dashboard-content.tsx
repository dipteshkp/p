"use client"

import { useSearchParams } from "next/navigation"
import { DashboardTopBar } from "./dashboard-top-bar"
import { MetricsPanel } from "./metrics-panel"
import { LiveChart } from "./live-chart"
import { ControlButtons } from "./control-buttons"
import { useSensorSimulation } from "@/hooks/use-sensor-simulation"

export type MonitoringMode = "structural" | "earthquake" | "tilt"
export type MonitoringStatus = "Idle" | "Monitoring" | "Stopped"

export function DashboardContent() {
  const searchParams = useSearchParams()
  const mode = (searchParams.get("mode") as MonitoringMode) || "structural"

  const {
    status,
    metrics,
    chartData,
    startMonitoring,
    stopMonitoring,
    exportData,
  } = useSensorSimulation(mode,"external")

  return (
    <main className="animated-bg min-h-screen px-4 py-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <DashboardTopBar mode={mode} status={status} />
        <MetricsPanel mode={mode} metrics={metrics} />
        <LiveChart chartData={chartData} />
        <ControlButtons
          status={status}
          onStart={startMonitoring}
          onStop={stopMonitoring}
          onExport={exportData}
        />
      </div>
    </main>
  )
}
