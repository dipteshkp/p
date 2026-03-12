"use client"

import { useRouter } from "next/navigation"
import { Smartphone, Cpu } from "lucide-react"
import { GlassCard } from "@/components/glass-card"

export function SensorSelection() {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard
        interactive
        onClick={() => router.push("/mode?source=phone")}
        className="flex flex-col items-center text-center gap-4 py-10"
      >
        <div className="p-4 rounded-2xl bg-[#06b6d4]/10 border border-[#06b6d4]/20">
          <Smartphone className="h-12 w-12 text-[#06b6d4]" />
        </div>
        <h2 className="text-xl font-semibold text-[#e8ecf4]">Phone Sensor</h2>
        <p className="text-sm text-[#94a3b8] max-w-xs leading-relaxed">
          Use smartphone accelerometer and gyroscope for real-time data capture.
        </p>
        <span className="text-xs text-[#22d3ee] font-medium mt-2 px-3 py-1 rounded-full bg-[#06b6d4]/10">
          Recommended
        </span>
      </GlassCard>

      <GlassCard
        interactive
        onClick={() => router.push("/mode?source=external")}
        className="flex flex-col items-center text-center gap-4 py-10"
      >
        <div className="p-4 rounded-2xl bg-[#94a3b8]/10 border border-[#94a3b8]/20">
          <Cpu className="h-12 w-12 text-[#94a3b8]" />
        </div>
        <h2 className="text-xl font-semibold text-[#e8ecf4]">MPU6050 Sensor</h2>
        <p className="text-sm text-[#94a3b8] max-w-xs leading-relaxed">
          External Arduino/ESP32 connected sensor for high-precision structural monitoring.
        </p>
        <span className="text-xs text-[#94a3b8] font-medium mt-2 px-3 py-1 rounded-full bg-[#94a3b8]/10">
          Hardware Required
        </span>
      </GlassCard>
    </div>
  )
}
