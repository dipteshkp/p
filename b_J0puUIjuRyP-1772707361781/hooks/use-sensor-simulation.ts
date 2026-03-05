"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { MonitoringMode, MonitoringStatus } from "@/components/dashboard/dashboard-content"

const MAX_DATA_POINTS = 60

interface Metrics {
  primary: number
  secondary: number | string
}

export function useSensorSimulation(mode: MonitoringMode) {
  const [status, setStatus] = useState<MonitoringStatus>("Idle")
  const [metrics, setMetrics] = useState<Metrics>({ primary: 0, secondary: 0 })
  const [chartData, setChartData] = useState<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dataBufferRef = useRef<Array<{ x: number; y: number; z: number }>>([])
  const eventCounterRef = useRef(0)

  const computeMetrics = useCallback(
    (x: number, y: number, z: number): { magnitude: number; metrics: Metrics } => {
      const magnitude = Math.sqrt(x * x + y * y + z * z)

      switch (mode) {
        case "structural": {
          const buffer = dataBufferRef.current
          const rms = Math.sqrt(
            buffer.reduce((sum, d) => {
              const m = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)
              return sum + m * m
            }, 0) / Math.max(buffer.length, 1)
          )
          const peak = Math.max(
            ...buffer.map((d) => Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)),
            magnitude
          )
          return { magnitude, metrics: { primary: rms, secondary: peak } }
        }
        case "earthquake": {
          if (magnitude > 1.5) {
            eventCounterRef.current += 1
          }
          return {
            magnitude,
            metrics: { primary: magnitude, secondary: eventCounterRef.current },
          }
        }
        case "tilt": {
          const tiltAngle = Math.atan2(Math.sqrt(x * x + y * y), z) * (180 / Math.PI)
          const stability = tiltAngle > 15 ? "Excessive Tilt" : "Stable"
          return { magnitude, metrics: { primary: tiltAngle, secondary: stability } }
        }
        default:
          return { magnitude, metrics: { primary: 0, secondary: 0 } }
      }
    },
    [mode]
  )

  const startMonitoring = useCallback(() => {
    if (status === "Monitoring") return

    setStatus("Monitoring")
    eventCounterRef.current = 0
    dataBufferRef.current = []
    setChartData([])

    intervalRef.current = setInterval(() => {
      const x = (Math.random() - 0.5) * 2
      const y = (Math.random() - 0.5) * 2
      const z = 9.8 + (Math.random() - 0.5) * 0.5

      dataBufferRef.current.push({ x, y, z })
      if (dataBufferRef.current.length > MAX_DATA_POINTS) {
        dataBufferRef.current.shift()
      }

      const { magnitude, metrics: newMetrics } = computeMetrics(x, y, z)
      setMetrics(newMetrics)
      setChartData((prev) => {
        const next = [...prev, magnitude]
        return next.length > MAX_DATA_POINTS ? next.slice(-MAX_DATA_POINTS) : next
      })
    }, 80)
  }, [status, computeMetrics])

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setStatus("Stopped")
  }, [])

  const exportData = useCallback(() => {
    const buffer = dataBufferRef.current
    if (buffer.length === 0) {
      alert("No data to export. Start monitoring first.")
      return
    }
    const header = "index,x,y,z,magnitude\n"
    const rows = buffer
      .map((d, i) => {
        const mag = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)
        return `${i},${d.x.toFixed(4)},${d.y.toFixed(4)},${d.z.toFixed(4)},${mag.toFixed(4)}`
      })
      .join("\n")

    const blob = new Blob([header + rows], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sensor-data-${mode}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [mode])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    status,
    metrics,
    chartData,
    startMonitoring,
    stopMonitoring,
    exportData,
  }
}
