"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { MonitoringMode, MonitoringStatus } from "@/components/dashboard/dashboard-content"

const MAX_DATA_POINTS = 60

interface Metrics {
  // ADDED 'string' HERE TO MATCH THE PANEL
  primary: number | string 
  secondary: number | string
}

export function useSensorSimulation(mode: MonitoringMode, hardwareSource: "phone" | "external" = "phone") {
  const [status, setStatus] = useState<MonitoringStatus>("Idle")
  const [metrics, setMetrics] = useState<Metrics>({ primary: 0, secondary: 0 })
  const [chartData, setChartData] = useState<number[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dataBufferRef = useRef<Array<{ x: number; y: number; z: number; sw: number }>>([])
  const eventCounterRef = useRef(0)
  
  // Stores the absolute latest reading from sensors
  const latestReadingRef = useRef({ x: 0, y: 0, z: 0 })
  const readerRef = useRef<any>(null)

 const computeMetrics = useCallback(
    // Added 'sw' to the input parameters
    (x: number, y: number, z: number, sw: number): { chartValue: number; metrics: Metrics } => {
      const magnitude = Math.sqrt(x * x + y * y + z * z)

      switch (mode) {
        case "structural": {
          // ... (Keep your existing structural logic here) ...
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
          return { chartValue: magnitude, metrics: { primary: rms, secondary: peak } }
        }
        case "earthquake": {
          // NEW EARTHQUAKE LOGIC USING SW-18015P
          const isVibrating = sw === 1 // Assuming your sensor triggers HIGH (1) on vibration
          
          if (isVibrating) { 
            eventCounterRef.current += 1
          }
          
          return {
            // Plots 1 on the graph for a vibration spike, 0 for stable
            chartValue: isVibrating ? 1 : 0, 
            metrics: { 
              primary: isVibrating ? "VIBRATING" : "Stable", // Text on the dashboard
              secondary: eventCounterRef.current // Total vibration events tracked
            },
          }
        }
        case "tilt": {
          // ... (Keep your existing tilt logic here) ...
          const tiltAngle = Math.atan2(x, z) * (180 / Math.PI)
          const stability = Math.abs(tiltAngle) > 15 ? "Excessive Tilt" : "Stable"
          return { chartValue: tiltAngle, metrics: { primary: Math.abs(tiltAngle), secondary: stability } }
        }
        default:
          return { chartValue: magnitude, metrics: { primary: 0, secondary: 0 } }
      }
    },
    [mode]
  )

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    if (event.accelerationIncludingGravity) {
      latestReadingRef.current = {
        x: event.accelerationIncludingGravity.x || 0,
        y: event.accelerationIncludingGravity.y || 0,
        z: event.accelerationIncludingGravity.z || 0,
      }
    }
  }, [])

  // NEW: Function to connect Arduino via Web Serial API
  const connectExternalDevice = async () => {
    if (!("serial" in navigator)) {
      setError("Web Serial API not supported. Please use Chrome or Edge.")
      return
    }
    try {
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 115200 }) // Must match Arduino baud rate
      setIsConnected(true)
      
      const textDecoder = new TextDecoderStream()
      port.readable.pipeTo(textDecoder.writable)
      const reader = textDecoder.readable.getReader()
      readerRef.current = reader

      let buffer = ""

      // Continuous loop to read incoming serial data
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        if (value) {
          buffer += value
          const lines = buffer.split('\n')
          buffer = lines.pop() || "" // Keep incomplete line in buffer
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line.trim())
              // Update latest reading with Arduino JSON {x, y, z}
              latestReadingRef.current = {
                x: data.x || 0,
                y: data.y || 0,
                z: data.z || 0,
                sw: data.sw !== undefined ? data.sw : 0 // Reads the SW-18015P sensor
              }
            } catch (e) {
              // Ignore partial or corrupted JSON lines
            }
          }
        }
      }
    } catch (err) {
      console.error(err)
      setError("Failed to connect to hardware device.")
    }
  }

  const startMonitoring = useCallback(async () => {
    if (status === "Monitoring") return
    setError(null)

    if (hardwareSource === "phone") {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceMotionEvent as any).requestPermission()
          if (permissionState !== 'granted') return setError("Permission denied.")
        } catch (err) {
          return setError("Error requesting sensor permission.")
        }
      }
      window.addEventListener('devicemotion', handleDeviceMotion)
    }

    setStatus("Monitoring")
    eventCounterRef.current = 0
    dataBufferRef.current = []
    setChartData([])

intervalRef.current = setInterval(() => {
      // Pull sw out of the reference
      const { x, y, z, sw } = latestReadingRef.current

      // Push sw to the buffer
      dataBufferRef.current.push({ x, y, z, sw }) 
      if (dataBufferRef.current.length > MAX_DATA_POINTS) {
        dataBufferRef.current.shift()
      }

      // Pass sw into computeMetrics
      const { chartValue, metrics: newMetrics } = computeMetrics(x, y, z, sw)
      
      setMetrics(newMetrics)
      setChartData((prev) => {
        const next = [...prev, chartValue]
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
    if (buffer.length === 0) return alert("No data to export.")

    let header = ""
    let rows = ""
    let summary = ""

    if (mode === "tilt") {
      // Custom export for Tilt Mode
      header = "index,x,y,z,tilt_angle,status\n"
      
      let excessiveCount = 0
      let stableCount = 0

      rows = buffer.map((d, i) => {
        // Calculate the pitch angle
        const tiltAngle = Math.atan2(d.x, d.z) * (180 / Math.PI)
        const isExcessive = Math.abs(tiltAngle) > 15
        const stability = isExcessive ? "Excessive Tilt" : "Stable"

        if (isExcessive) {
          excessiveCount++
        } else {
          stableCount++
        }

        return `${i},${d.x.toFixed(4)},${d.y.toFixed(4)},${d.z.toFixed(4)},${tiltAngle.toFixed(2)},${stability}`
      }).join("\n")

      // Calculate time in seconds (each data point is recorded every 80ms)
      const excessiveTime = (excessiveCount * 0.08).toFixed(2)
      const stableTime = (stableCount * 0.08).toFixed(2)

      summary = `\n\n--- SUMMARY ---\n`
      summary += `Stable Time (seconds),${stableTime}\n`
      summary += `Excessive Tilt Time (seconds),${excessiveTime}\n`

    } else {
      // Default export for Structural & Earthquake Modes
      header = "index,x,y,z,magnitude\n"
      
      rows = buffer.map((d, i) => {
        const mag = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z)
        return `${i},${d.x.toFixed(4)},${d.y.toFixed(4)},${d.z.toFixed(4)},${mag.toFixed(4)}`
      }).join("\n")
    }

    // Combine everything and trigger the download
    const blob = new Blob([header + rows + summary], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sensor-data-${mode}-${Date.now()}.csv`
    a.click()
  }, [mode])

  return {
    status,
    metrics,
    chartData,
    error,
    isConnected,
    connectExternalDevice,
    startMonitoring,
    stopMonitoring,
    exportData,
  }
}
