"use client"

import { useRef, useEffect } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { GlassCard } from "@/components/glass-card"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

interface LiveChartProps {
  chartData: number[]
}

export function LiveChart({ chartData }: LiveChartProps) {
  const chartRef = useRef<ChartJS<"line"> | null>(null)

  useEffect(() => {
    const chart = chartRef.current
    if (chart) {
      chart.update("none")
    }
  }, [chartData])

  const labels = chartData.map((_, i) => {
    if (i % 10 === 0) return `${i}`
    return ""
  })

  const data = {
    labels,
    datasets: [
      {
        label: "Magnitude",
        data: chartData,
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.08)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    scales: {
      x: {
        grid: {
          color: "rgba(255, 255, 255, 0.04)",
        },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
          maxRotation: 0,
        },
        border: {
          color: "rgba(255, 255, 255, 0.08)",
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.04)",
        },
        ticks: {
          color: "#64748b",
          font: { size: 10 },
        },
        border: {
          color: "rgba(255, 255, 255, 0.08)",
        },
        suggestedMin: 0,
        suggestedMax: 2,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#e8ecf4",
        bodyColor: "#94a3b8",
        borderColor: "rgba(6, 182, 212, 0.3)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  }

  return (
    <GlassCard className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#06b6d4]" />
          <span className="text-sm font-medium text-[#e8ecf4]">Live Signal</span>
        </div>
        <span className="text-xs text-[#64748b]">
          {chartData.length} / 600 samples
        </span>
      </div>
      <div className="h-64 md:h-80">
        <Line ref={chartRef} data={data} options={options} />
      </div>
    </GlassCard>
  )
}
