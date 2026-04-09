"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import { DashboardTopBar } from "./dashboard-top-bar"
import { MetricsPanel } from "./metrics-panel"
import { LiveChart } from "./live-chart"
import { ControlButtons } from "./control-buttons"
import { useSensorSimulation } from "@/hooks/use-sensor-simulation"

export type MonitoringMode = "structural" | "earthquake" | "tilt"
export type MonitoringStatus = "Idle" | "Monitoring" | "Stopped"
export type HardwareSource = "phone" | "external"

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

  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // --- ALARM LOGIC ---
  useEffect(() => {
    const isDanger = metrics.secondary === "Excessive Tilt" || metrics.primary === "VIBRATING"

    if (isDanger && status === "Monitoring") {
      setIsAlarmActive(true)
      playAlarmBeep()
    } else {
      setIsAlarmActive(false)
    }
  }, [metrics, status])

  const playAlarmBeep = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = "square"
    oscillator.frequency.setValueAtTime(800, ctx.currentTime)
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.5)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative max-w-6xl mx-auto w-full">
      
      {/* RED FLASH OVERLAY FOR ALARM */}
      {isAlarmActive && (
        <div className="absolute inset-0 z-50 pointer-events-none bg-red-500/20 animate-pulse border-4 border-red-500 flex items-center justify-center">
            <div className="bg-red-500 text-white px-8 py-4 rounded-full font-bold text-2xl flex items-center gap-4 shadow-[0_0_50px_rgba(239,68,68,0.8)]">
                <AlertTriangle className="h-8 w-8 animate-bounce" />
                DANGER DETECTED
            </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 mt-6 p-3 text-center text-red-400 text-sm rounded-md">
          {error}
        </div>
      )}
      
      {/* ERROR 2 FIXED: Removed the invalid 'status' prop here */}
      <DashboardTopBar 
        mode={mode} 
        source={source} 
        isConnected={isConnected} 
        onConnect={connectExternalDevice} 
      />

      <div className="flex-1 py-6 overflow-auto">
        <div className="space-y-6">
          <MetricsPanel mode={mode} metrics={metrics} />
          
          {/* ERROR 1 FIXED: Passed mode and data instead of chartData */}
          <LiveChart mode={mode} data={chartData} />

          <ControlButtons
            status={status}
            onStart={startMonitoring}
            onStop={stopMonitoring}
            onExport={exportData}
          />
        </div>
      </div>
    </div>
  )
}

export function DashboardContent() {
  return (
    <main className="animated-bg min-h-screen px-4 py-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-[#94a3b8] py-10">
          Loading dashboard...
        </div>
      }>
        <DashboardInner />
      </Suspense>
    </main>
  )
}
