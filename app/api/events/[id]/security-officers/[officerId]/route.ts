import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string; officerId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id: eventId, officerId } = params
    const { active } = await request.json()

    // Verify the user is the organizer of this event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ message: "Event not found or access denied" }, { status: 404 })
    }

    // Update security officer
    const officer = await prisma.securityOfficer.update({
      where: {
        id: officerId,
        eventId,
      },
      data: { active },
      include: {
        user: {
          select: {
            id: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json({ officer })
  } catch (error) {
    console.error("Error updating security officer:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; officerId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id: eventId, officerId } = params

    // Verify the user is the organizer of this event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: session.user.id,
      },
    })

    if (!event) {
      return NextResponse.json({ message: "Event not found or access denied" }, { status: 404 })
    }

    // Delete security officer
    await prisma.securityOfficer.delete({
      where: {
        id: officerId,
        eventId,
      },
    })

    return NextResponse.json({ message: "Security officer deleted successfully" })
  } catch (error) {
    console.error("Error deleting security officer:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
