import { Suspense } from "react"
import { AttendeeManagementPage } from "@/components/organizer/attendee-management-page"
import { PageLoader } from "@/components/ui/loader"

interface AttendeePageProps {
  params: {
    id: string
  }
}

export default function EventAttendees({ params }: AttendeePageProps) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AttendeeManagementPage eventId={params.id} />
    </Suspense>
  )
}
