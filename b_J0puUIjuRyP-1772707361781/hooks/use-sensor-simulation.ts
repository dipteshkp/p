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
  const latestExternalReadingRef = useRef({ x: 0, y: 0, z: 0 })
  
  // Ref to hold the active USB serial port and reader
  const serialPortRef = useRef<any>(null)
  const keepReadingRef = useRef(true)

  const computeMetrics = useCallback(
    // ... (Keep your exact existing computeMetrics code here)
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
    // ... (Keep your existing phone sensor code)
    if (event.accelerationIncludingGravity) {
      latestReadingRef.current = {
        x: event.accelerationIncludingGravity.x || 0,
        y: event.accelerationIncludingGravity.y || 0,
        z: event.accelerationIncludingGravity.z || 0,
      }
    }
  }, [])

  // Helper function to handle the continuous USB data stream
  const readSerialData = async (port: any) => {
    const textDecoder = new TextDecoderStream()
    const readableStreamClosed = port.readable.pipeTo(textDecoder.writable)
    const reader = textDecoder.readable.getReader()
    
    let buffer = ""

    try {
              // Extract the numbers from the "x:-0.08y:0.02z:1.01" string using Regex
              const match = trimmedLine.match(/x:\s*([-\d.]+)\s*y:\s*([-\d.]+)\s*z:\s*([-\d.]+)/i)
              
              if (match) {
                // If it matches the Arduino format, parse the floats
                latestExternalReadingRef.current = { 
                  x: parseFloat(match[1]), 
                  y: parseFloat(match[2]), 
                  z: parseFloat(match[3]) 
                }
              } else {
                // Keep the JSON parser as a backup just in case
                const data = JSON.parse(trimmedLine)
                latestExternalReadingRef.current = { x: data.x, y: data.y, z: data.z }
              }
            } catch (e) {
              console.warn("Could not parse serial data line:", trimmedLine)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error reading serial data", error)
      setError("Lost connection to USB device.")
    } finally {
      reader.releaseLock()
    }
  }

  const startMonitoring = useCallback(async () => {
    if (status === "Monitoring") return
    setError(null)

    if (hardwareSource === "phone") {
      // ... (Phone permission logic remains exactly the same)
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        try {
          const permissionState = await (DeviceMotionEvent as any).requestPermission()
          if (permissionState !== 'granted') {
            setError("Permission to access device sensors was denied.")
            return
          }
        } catch (err) {
          setError("Error requesting sensor permission. Make sure you are on HTTPS.")
          return
        }
      }
      window.addEventListener('devicemotion', handleDeviceMotion)
    } else if (hardwareSource === "external") {
      // --- NEW USB SERIAL LOGIC ---
      if (!("serial" in navigator)) {
        setError("Your browser does not support Web Serial. Please use Chrome or Edge.")
        return
      }

      try {
        // This prompts the user to select the Arduino from a popup
        const port = await (navigator as any).serial.requestPort()
        // Ensure baudRate matches your Arduino Serial.begin(115200)
        await port.open({ baudRate: 115200 }) 
        
        serialPortRef.current = port
        keepReadingRef.current = true
        
        // Start the background reading loop
        readSerialData(port)

      } catch (err) {
        console.error(err)
        setError("Failed to connect to USB device. Make sure it is plugged in and no other app (like Arduino IDE) is using the port.")
        return
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
        currentX = latestExternalReadingRef.current.x
        currentY = latestExternalReadingRef.current.y
        currentZ = latestExternalReadingRef.current.z
      }

      dataBufferRef.current.push({ x: currentX, y: currentY, z: currentZ })
      if (dataBufferRef.current.length > MAX_DATA_POINTS) { //
        dataBufferRef.current.shift()
      }

      const { magnitude, metrics: newMetrics } = computeMetrics(currentX, currentY, currentZ) //
      setMetrics(newMetrics)
      setChartData((prev) => {
        const next = [...prev, magnitude]
        return next.length > MAX_DATA_POINTS ? next.slice(-MAX_DATA_POINTS) : next
      })
    }, 80)
  }, [status, hardwareSource, computeMetrics, handleDeviceMotion])

  const stopMonitoring = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    if (hardwareSource === "phone") {
      window.removeEventListener('devicemotion', handleDeviceMotion)
    } else if (hardwareSource === "external") {
      // Properly close the USB serial port
      keepReadingRef.current = false
      if (serialPortRef.current) {
        try {
          await serialPortRef.current.close()
        } catch (e) {
          console.error("Error closing port:", e)
        }
        serialPortRef.current = null
      }
    }
    setStatus("Stopped")
  }, [hardwareSource, handleDeviceMotion])

  // ... (exportData and useEffect remain the same)
