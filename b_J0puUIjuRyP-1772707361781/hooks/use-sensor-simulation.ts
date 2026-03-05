"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { MonitoringMode, MonitoringStatus } from "@/components/dashboard/dashboard-content"

const MAX_DATA_POINTS = 60

interface Metrics {
  primary: number
  secondary: number | string
}

export function useSensorSimulation(mode: MonitoringMode, hardwareSource: "phone" | "external" = "phone") {
  const [status, setStatus] = useState<MonitoringStatus>("Idle")
  const [metrics, setMetrics] = useState<Metrics>({ primary: 0, secondary: 0 })
  const [chartData, setChartData] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dataBufferRef = useRef<Array<{ x: number; y: number; z: number }>>([])
  const eventCounterRef = useRef(0)
  
  // Stores the absolute latest reading from the phone sensor
  const latestReadingRef = useRef({ x: 0, y: 0, z: 0 })

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
          if (magnitude > 1.5) { // Threshold for seismic event
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

  // Continuously update our ref with the latest phone sensor data
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (event.accelerationIncludingGravity) {
      latestReadingRef.current = {
        x: event.accelerationIncludingGravity.x || 0,
        y: event.accelerationIncludingGravity.y || 0,
        z: event.accelerationIncludingGravity.z || 0,
      }
    }
  }, [])

  const startMonitoring = useCallback(async () => {
    if (status === "Monitoring") return
    setError(null)

    // Setup for Phone Sensor
    if (hardwareSource === "phone") {
      // Handle iOS 13+ permission requirements
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceMotionEvent as any).requestPermission()
          if (permissionState !== 'granted') {
            setError("Permission to access device sensors was denied.")
            return
          }
        } catch (err) {
          setError("Error requesting sensor permission. Make sure you are on HTTPS.")
          console.error(err)
          return
        }
      }
      window.addEventListener('devicemotion', handleDeviceMotion)
    }

    setStatus("Monitoring")
    eventCounterRef.current = 0
    dataBufferRef.current = []
    setChartData([])

    // Sample the data every 80ms
    intervalRef.current = setInterval(() => {
      let currentX = 0
      let currentY = 0
      let currentZ = 0

      if (hardwareSource === "phone") {
        currentX = latestReadingRef.current.x
        currentY = latestReadingRef.current.y
        currentZ = latestReadingRef.current.z
      } else if (hardwareSource === "external") {
        // PLACEHOLDER FOR EXTERNAL HARDWARE (ESP32/MPU6050)
        // Set to 0 so it specifically bypasses the phone's sensors.
        // Later, you will fetch WebSocket data here.
        currentX = 0
        currentY = 0
        currentZ = 0
      }

      dataBufferRef.current.push({ x: currentX, y: currentY, z: currentZ })
      if (dataBufferRef.current.length > MAX_DATA_POINTS) {
        dataBufferRef.current.shift()
      }

      const { magnitude, metrics: newMetrics } = computeMetrics(currentX, currentY, currentZ)
      setMetrics(newMetrics)
      setChartData((prev) => {
        const next = [...prev, magnitude]
        return next.length > MAX_DATA_POINTS ? next.slice(-MAX_DATA_POINTS) : next
      })
    }, 80)
  }, [status, hardwareSource, computeMetrics, handleDeviceMotion])

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (hardwareSource === "phone") {
      window.removeEventListener('devicemotion', handleDeviceMotion)
    }
    setStatus("Stopped")
  }, [hardwareSource, handleDeviceMotion])

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
      window.removeEventListener('devicemotion', handleDeviceMotion)
    }
  }, [handleDeviceMotion])

  return {
    status,
    metrics,
    chartData,
    error, // New exported error state
    startMonitoring,
    stopMonitoring,
    exportData,
  }
}
