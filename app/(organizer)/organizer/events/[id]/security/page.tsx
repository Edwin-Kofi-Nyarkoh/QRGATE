import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SecurityManagement } from "@/components/organizer/security-management"
import { Loader2 } from "lucide-react"

interface SecurityManagementPageProps {
  params: {
    id: string
  }
}

async function getEvent(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export default async function SecurityManagementPage({ params }: SecurityManagementPageProps) {
  const { id: eventId } = params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>You must be logged in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const event = await getEvent(eventId)
  if (!event) {
    notFound()
  }

  // Check if the user is the organizer or an admin
  const isOrganizer = event.organizer.id === session.user.id
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  const isAdmin = user?.role === "ADMIN"

  if (!isOrganizer && !isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>You are not authorized to manage security for this event.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{event.title} - Security Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Event Date: {new Date(event.startDate).toLocaleDateString()} to{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </p>
          <p className="text-gray-500">Location: {event.location}</p>
        </CardContent>
      </Card>

      <Suspense fallback={<LoadingState />}>
        <SecurityManagement eventId={eventId} />
      </Suspense>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
