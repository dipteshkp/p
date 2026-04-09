"use client"

import { useState } from "react"
import { Upload, FileText, Activity, Compass, Zap } from "lucide-react" 
import Papa from "papaparse"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

import { BackButton } from "@/components/back-button"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"

export default function DataInterpretationPage() {
  // States for the 3 distinct data types
  const [accelData, setAccelData] = useState<Record<string, unknown>[]>([])
  const [tiltData, setTiltData] = useState<Record<string, unknown>[]>([])
  const [vibData, setVibData] = useState<Record<string, unknown>[]>([])

  const [fileNames, setFileNames] = useState({ accel: "", tilt: "", vib: "" })

  // Reusable helper function to parse CSV files safely
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>, 
    type: "accel" | "tilt" | "vib",
    setData: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileNames(prev => ({ ...prev, [type]: file.name }))

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.errors || results.errors.length === 0) {
          setData(results.data as Record<string, unknown>[])
        } else {
          alert(`Error reading ${type} file.`)
        }
      },
    })
  }

  return (
    <div className="animated-bg min-h-screen p-6 md:p-12 font-sans selection:bg-[#06b6d4]/30 selection:text-[#e8ecf4]">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#e8ecf4] flex items-center gap-3">
              <Upload className="h-8 w-8 text-purple-400" />
              Offline Data Interpretation
            </h1>
            <p className="text-[#94a3b8] mt-1">Upload your exported CSV files to visualize historical sensor data.</p>
          </div>
        </div>

        {/* Upload Grid for the 3 Files */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Accelerometer Upload */}
          <GlassCard className="p-6 flex flex-col items-center text-center gap-4">
            <Activity className="h-10 w-10 text-[#06b6d4]" />
            <h3 className="text-lg font-medium text-[#e8ecf4]">Accelerometer Data</h3>
            <label htmlFor="accel-upload" className="w-full mt-2">
              <Button asChild className="w-full bg-[#06b6d4]/20 hover:bg-[#06b6d4]/40 text-[#22d3ee] cursor-pointer">
                <span>{fileNames.accel ? "Change File" : "Upload CSV"}</span>
              </Button>
            </label>
            <input id="accel-upload" type="file" accept=".csv" className="hidden" 
              onChange={(e) => handleFileUpload(e, "accel", setAccelData)} 
            />
            {fileNames.accel && <p className="text-xs text-[#94a3b8] flex items-center gap-1"><FileText className="h-3 w-3"/> {fileNames.accel}</p>}
          </GlassCard>

          {/* 2. Gyroscope/Tilt Upload */}
          <GlassCard className="p-6 flex flex-col items-center text-center gap-4">
            <Compass className="h-10 w-10 text-[#8b5cf6]" />
            <h3 className="text-lg font-medium text-[#e8ecf4]">Gyroscope / Tilt Data</h3>
            <label htmlFor="tilt-upload" className="w-full mt-2">
              <Button asChild className="w-full bg-[#8b5cf6]/20 hover:bg-[#8b5cf6]/40 text-[#c4b5fd] cursor-pointer">
                <span>{fileNames.tilt ? "Change File" : "Upload CSV"}</span>
              </Button>
            </label>
            <input id="tilt-upload" type="file" accept=".csv" className="hidden" 
              onChange={(e) => handleFileUpload(e, "tilt", setTiltData)} 
            />
            {fileNames.tilt && <p className="text-xs text-[#94a3b8] flex items-center gap-1"><FileText className="h-3 w-3"/> {fileNames.tilt}</p>}
          </GlassCard>

          {/* 3. Vibration Upload */}
          <GlassCard className="p-6 flex flex-col items-center text-center gap-4">
            <Zap className="h-10 w-10 text-[#ef4444]" />
            <h3 className="text-lg font-medium text-[#e8ecf4]">Vibration Data</h3>
            <label htmlFor="vib-upload" className="w-full mt-2">
              <Button asChild className="w-full bg-[#ef4444]/20 hover:bg-[#ef4444]/40 text-[#fca5a5] cursor-pointer">
                <span>{fileNames.vib ? "Change File" : "Upload CSV"}</span>
              </Button>
            </label>
            <input id="vib-upload" type="file" accept=".csv" className="hidden" 
              onChange={(e) => handleFileUpload(e, "vib", setVibData)} 
            />
            {fileNames.vib && <p className="text-xs text-[#94a3b8] flex items-center gap-1"><FileText className="h-3 w-3"/> {fileNames.vib}</p>}
          </GlassCard>

        </div>

        {/* --- GRAPH 1: Accelerometer --- */}
        {accelData.length > 0 && (
          <GlassCard className="p-6 border border-[#06b6d4]/20">
             <h3 className="text-xl font-semibold text-[#e8ecf4] mb-4 flex items-center gap-2">
               <Activity className="h-5 w-5 text-[#06b6d4]" /> Accelerometer Magnitude
             </h3>
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="index" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ color: '#e8ecf4' }} />
                    <Legend />
                    <Line type="monotone" dataKey="magnitude" stroke="#06b6d4" strokeWidth={2} dot={false} name="Magnitude" />
                    <Line type="monotone" dataKey="x" stroke="#94a3b8" strokeWidth={1} dot={false} opacity={0.3} name="X Axis" />
                    <Line type="monotone" dataKey="y" stroke="#94a3b8" strokeWidth={1} dot={false} opacity={0.3} name="Y Axis" />
                    <Line type="monotone" dataKey="z" stroke="#94a3b8" strokeWidth={1} dot={false} opacity={0.3} name="Z Axis" />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </GlassCard>
        )}

        {/* --- GRAPH 2: Gyroscope/Tilt --- */}
        {tiltData.length > 0 && (
          <GlassCard className="p-6 border border-[#8b5cf6]/20">
             <h3 className="text-xl font-semibold text-[#e8ecf4] mb-4 flex items-center gap-2">
               <Compass className="h-5 w-5 text-[#8b5cf6]" /> Tilt Angle
             </h3>
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tiltData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="index" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ color: '#e8ecf4' }} />
                    <Legend />
                    <Line type="monotone" dataKey="tilt_angle" stroke="#8b5cf6" strokeWidth={3} dot={false} name="Tilt Angle (Degrees)" />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </GlassCard>
        )}

        {/* --- GRAPH 3: Vibrations --- */}
        {vibData.length > 0 && (
          <GlassCard className="p-6 border border-[#ef4444]/20">
             <h3 className="text-xl font-semibold text-[#e8ecf4] mb-4 flex items-center gap-2">
               <Zap className="h-5 w-5 text-[#ef4444]" /> Vibration Events
             </h3>
             <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {/* Step chart is perfect for on/off vibration sensors */}
                  <LineChart data={vibData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="index" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 1.5]} ticks={[0, 1]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ color: '#e8ecf4' }} />
                    <Legend />
                    <Line type="stepAfter" dataKey="sw" stroke="#ef4444" strokeWidth={3} dot={false} name="Vibration Status (1 = Active)" />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </GlassCard>
        )}

      </div>
    </div>
  )
}
