"use client"

import { useState } from "react"
import { UploadCloud, FileText, AlertCircle } from "lucide-react"
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
  const [data, setData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  // Handle the file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError(null)

    // Parse the CSV using PapaParse
    Papa.parse(file, {
      header: true, // Treat the first row as column names
      dynamicTyping: true, // Convert numbers automatically
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError("Error reading the CSV file. Please make sure it's valid.")
          return
        }

        // Save data and column headers for the chart
        const parsedData = results.data as any[]
        if (parsedData.length > 0) {
            setData(parsedData)
            setColumns(Object.keys(parsedData[0]).filter(key => key !== 'index' && key !== 'status'))
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
              <UploadCloud className="h-8 w-8 text-purple-400" />
              Data Interpretation
            </h1>
            <p className="text-[#94a3b8] mt-1">Upload an exported CSV file to visualize sensor graphs.</p>
          </div>
        </div>

        {/* Upload Area */}
        <GlassCard className="p-8 border border-white/5 bg-white/[0.02]">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#94a3b8]/30 rounded-xl p-10 hover:border-purple-400/50 transition-colors bg-black/20">
            <UploadCloud className="h-12 w-12 text-[#94a3b8] mb-4" />
            <h3 className="text-lg font-medium text-[#e8ecf4] mb-2">Upload CSV Data</h3>
            <p className="text-sm text-[#94a3b8] mb-6">Drag and drop or click to select a file</p>
            
            <label htmlFor="csv-upload">
              <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white cursor-pointer">
                <span>Select File</span>
              </Button>
            </label>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            {fileName && (
              <p className="mt-4 text-sm text-[#22d3ee] flex items-center gap-2">
                <FileText className="h-4 w-4" /> Loaded: {fileName}
              </p>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}
        </GlassCard>

        {/* Graph Display Area */}
        {data.length > 0 && (
          <GlassCard className="p-6 border border-white/5 bg-white/[0.02] flex flex-col">
             <h3 className="text-xl font-semibold text-[#e8ecf4] mb-6 border-b border-white/10 pb-4">
               Visualization Analysis
             </h3>
             
             <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="index" 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      tick={{ fill: '#94a3b8' }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e8ecf4' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                    
                    {/* Dynamically render a line for every numerical column found in the CSV (except index) */}
                    {columns.includes('magnitude') && (
                        <Line type="monotone" dataKey="magnitude" stroke="#06b6d4" strokeWidth={2} dot={false} name="Magnitude" />
                    )}
                    {columns.includes('tilt_angle') && (
                        <Line type="monotone" dataKey="tilt_angle" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Tilt Angle" />
                    )}
                    {columns.includes('x') && (
                        <Line type="monotone" dataKey="x" stroke="#ef4444" strokeWidth={1} dot={false} opacity={0.5} name="X Axis" />
                    )}
                    {columns.includes('y') && (
                        <Line type="monotone" dataKey="y" stroke="#22c55e" strokeWidth={1} dot={false} opacity={0.5} name="Y Axis" />
                    )}
                    {columns.includes('z') && (
                        <Line type="monotone" dataKey="z" stroke="#eab308" strokeWidth={1} dot={false} opacity={0.5} name="Z Axis" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
