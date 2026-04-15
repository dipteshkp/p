import { SensorSelection } from "@/components/sensor-selection"
import { BackButton } from "@/components/back-button"

export default function SensorPage() {
  return (
    <main className="animated-bg min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <BackButton href="/" label="Home" />

        <div className="mt-12 text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#e8ecf4] mb-3">
            Select Sensor Source
          </h1>
          <p className="text-[#94a3b8] text-base">
            Choose how you want to capture sensor data
          </p>
        </div>

        <SensorSelection />
      </div>
    </main>
  )
}
