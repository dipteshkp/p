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
  
  // Refs for incoming data
  const latestReadingRef = useRef({ x: 0, y: 0, z: 0 })
  const latestExternalReadingRef = useRef({ x: 0, y: 0, z: 0 }) // New ref for external hardware
  const wsRef = useRef<WebSocket | null>(null) // WebSocket reference

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

    if (hardwareSource === "phone") {
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
    } else if (hardwareSource === "external") {
      // Connect to the ESP32 WebSocket server
      // Replace with your ESP32's actual local IP address
      const esp32Ip = "192.168.1.100" 
      wsRef.current = new WebSocket(`ws://${esp32Ip}:81`)

      wsRef.current.onopen = () => console.log("Connected to ESP32")
      wsRef.current.onerror = () => setError("Failed to connect to hardware. Check IP and Wi-Fi.")
      
      wsRef.current.onmessage = (event) => {
        try {
          // Expecting JSON from Arduino: {"x": 0.5, "y": 0.1, "z": 9.8}
          const data = JSON.parse(event.data)
          latestExternalReadingRef.current = { x: data.x, y: data.y, z: data.z }
        } catch (e) {
          console.error("Error parsing sensor data", e)
        }
      }
    }

    setStatus("Monitoring")
    eventCounterRef.current = 0
    dataBufferRef.current = []
    setChartData([])

    intervalRef.current = setInterval(() => {
      let currentX = 0
      let currentY = 0
      let currentZ = 0

      if (hardwareSource === "phone") {
        currentX = latestReadingRef.current.x
        currentY = latestReadingRef.current.y
        currentZ = latestReadingRef.current.z
      } else if (hardwareSource === "external") {
        // Read the latest data received from the WebSocket
        currentX = latestExternalReadingRef.current.x
        currentY = latestExternalReadingRef.current.y
        currentZ = latestExternalReadingRef.current.z
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
    } else if (hardwareSource === "external" && wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStatus("Stopped")
  }, [hardwareSource, handleDeviceMotion])

  // ... (exportData and useEffect remain the same as your original file)
