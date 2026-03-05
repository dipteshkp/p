import { Suspense } from "react"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardLoading() {
  return (
    <div className="animated-bg min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-2 border-[#06b6d4] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#94a3b8] text-sm">Loading dashboard...</p>
      </div>
    </div>
  )
}
