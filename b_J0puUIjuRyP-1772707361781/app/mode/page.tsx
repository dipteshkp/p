import { ModeSelection } from "@/components/mode-selection"
import { BackButton } from "@/components/back-button"

export default function ModePage() {
  return (
    <main className="animated-bg min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <BackButton href="/sensor" label="Sensor Selection" />

        <div className="mt-12 text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#e8ecf4] mb-3">
            Monitoring Mode
          </h1>
          <p className="text-[#94a3b8] text-base">
            Select the type of monitoring you need
          </p>
        </div>

        <ModeSelection />
      </div>
    </main>
  )
}
