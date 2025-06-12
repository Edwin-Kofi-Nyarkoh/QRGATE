import { Suspense } from "react"
import { SecurityOfficerPage } from "@/components/security/security-officer-page"

interface SecurityPageProps {
  params: {
    eventId: string
  }
}

export default function SecurityPage({ params }: SecurityPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <SecurityOfficerPage eventId={params.eventId} />
      </Suspense>
    </div>
  )
}
