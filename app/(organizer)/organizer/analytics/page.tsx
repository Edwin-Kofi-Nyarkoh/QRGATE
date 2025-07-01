import { Suspense } from "react"
import { AnalyticsDashboard } from "@/components/organizer/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Detailed insights into your events and performance</p>
      </div>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}
