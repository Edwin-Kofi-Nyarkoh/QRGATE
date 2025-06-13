import { Suspense } from "react"
import { AttendeesOverviewPage } from "@/components/organizer/attendees-overview-page"
import { PageLoader } from "@/components/ui/loader"

export default function Attendees() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AttendeesOverviewPage />
    </Suspense>
  )
}
