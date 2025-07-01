import { Suspense } from "react"
import { OrganizerDashboard } from "@/components/organizer/organizer-dashboard"

export default function OrganizerDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrganizerDashboard />
    </Suspense>
  )
}
