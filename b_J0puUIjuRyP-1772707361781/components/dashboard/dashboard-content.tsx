"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardTopBar } from "./dashboard-top-bar"
import { MetricsPanel } from "./metrics-panel"
import { LiveChart } from "./live-chart"
import { ControlButtons } from "./control-buttons"
import { useSensorSimulation } from "@/hooks/use-sensor-simulation"
import { AlertTriangle } from "lucide-react"

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

  // --- NEW ALARM LOGIC ---
  useEffect(() => {
    // Determine if we are in a danger state based on your sensor rules
    const isDanger = 
      metrics.secondary === "Excessive Tilt" || 
      metrics.primary === "VIBRATING"

    if (isDanger && status === "Monitoring") {
      setIsAlarmActive(true)
      playAlarmBeep()
    } else {
      setIsAlarmActive(false)
    }
  }, [metrics, status])

  // Function to generate a loud, synthetic beep using the browser
  const playAlarmBeep = () => {
    // Only beep once per danger tick to avoid overlapping noise
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.type = "square" // Harsh, alarm-like sound
    oscillator.frequency.setValueAtTime(800, ctx.currentTime) // High pitch
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime) // Volume control
    gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5)

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.5)
  }
  // -----------------------

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative">
      
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
        <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <DashboardTopBar 
        mode={mode} 
        source={source} 
        isConnected={isConnected} 
        onConnect={connectExternalDevice} 
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <MetricsPanel mode={mode} metrics={metrics} />
          
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
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardInner />
    </Suspense>
  )
}
